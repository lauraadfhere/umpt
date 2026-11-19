"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

type ToolItem = { command: string; caption: string; content: ReactNode; value?: string; prompt?: string };

const icon = (path: string) => (
  <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

/** Extracts the embed URL from YouTube or Vimeo links; returns null for other hosts. */
export function toEmbedUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v") ?? url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/)?.[1] ?? "";
    return /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com") {
    const id = url.pathname.match(/\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

type Props = {
  id: string;
  label?: string;
  placeholder: string;
  value: string;
  onChange: (html: string) => void;
  size?: "default" | "compact";
  uploadImage?: (file: File) => Promise<string>;
};

export function RichTextEditor({ id, label, placeholder, value, onChange, size = "default", uploadImage }: Props) {
  const t = useTranslations("dashboard.editor");
  const editor = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<"image" | "file" | null>(null);
  const [notice, setNotice] = useState("");

  // Seed once so the caret is not reset on every keystroke.
  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync() {
    onChange(editor.current?.innerHTML ?? "");
  }

  function escape(text: string) {
    return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function insertHtml(html: string) {
    editor.current?.focus();
    document.execCommand("insertHTML", false, html);
    sync();
  }

  async function uploadFile(file: File) {
    if (uploadImage) return uploadImage(file);
    const { uploadAdminImage } = await import("@/lib/client-upload");
    return uploadAdminImage(file);
  }

  const groups: ToolItem[][] = [
    [
      { command: "bold", caption: t("bold"), content: <span className="text-[15px] font-bold">B</span> },
      { command: "italic", caption: t("italic"), content: <span className="text-[15px] italic">I</span> },
      { command: "underline", caption: t("underline"), content: <span className="text-[15px] underline">U</span> },
    ],
    [
      { command: "formatBlock", value: "pre", caption: t("code"), content: icon("M16 18l6-6-6-6M8 6l-6 6 6 6") },
      { command: "formatBlock", value: "blockquote", caption: t("quote"), content: icon("M7 17h3l2-4V7H6v6h3M14 17h3l2-4V7h-6v6h3") },
    ],
    [{ command: "createLink", caption: t("link"), prompt: "https://", content: icon("M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1") }],
    [
      { command: "insertUnorderedList", caption: t("bulleted"), content: icon("M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01") },
      { command: "insertOrderedList", caption: t("numbered"), content: icon("M10 6h11M10 12h11M10 18h11M4 4v4M3 8h2M3 14h2l-2 3h2") },
    ],
    [
      { command: "formatBlock", value: "h3", caption: t("heading"), content: <span className="text-[13px] font-bold">H</span> },
      { command: "formatBlock", value: "h2", caption: t("headingLarge"), content: <span className="text-[13px] font-bold">H2</span> },
    ],
    [
      { command: "insertImage", caption: t("image"), content: icon("M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M9 9h.01") },
      { command: "insertVideo", caption: t("video"), content: icon("M4 6h12v12H4zM16 10l5-3v10l-5-3") },
      { command: "insertButton", caption: t("button"), content: icon("M4 9h16v6H4zM8 12h8") },
      { command: "insertTable", caption: t("table"), content: icon("M3 4h18v16H3zM3 10h18M3 15h18M9 4v16M15 4v16") },
    ],
    [{ command: "removeFormat", caption: t("clear"), content: icon("M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3") }],
  ];

  function run(item: ToolItem) {
    setNotice("");
    if (item.command === "createLink") {
      editor.current?.focus();
      const url = window.prompt(item.caption, item.prompt ?? "https://");
      if (!url || !/^https?:\/\//i.test(url.trim())) return;
      document.execCommand("createLink", false, url.trim());
      sync();
    } else if (item.command === "insertImage" || item.command === "insertFile") {
      setPending(item.command === "insertImage" ? "image" : "file");
      fileInput.current?.click();
    } else if (item.command === "insertVideo") {
      editor.current?.focus();
      const url = window.prompt(t("videoPrompt"), "https://");
      if (!url) return;
      const embed = toEmbedUrl(url);
      if (!embed) {
        setNotice(t("videoOnly"));
        return;
      }
      insertHtml(`<iframe src="${escape(embed)}"></iframe><p></p>`);
    } else if (item.command === "insertButton") {
      editor.current?.focus();
      const text = window.prompt(t("buttonText"), t("buttonDefault"));
      if (!text?.trim()) return;
      const url = window.prompt(t("buttonLink"), "https://");
      if (!url || !/^https?:\/\//i.test(url.trim())) {
        setNotice(t("buttonLinkInvalid"));
        return;
      }
      insertHtml(`<p><a href="${escape(url.trim())}" data-variant="button">${escape(text.trim())}</a></p>`);
    } else if (item.command === "insertTable") {
      const columns = Math.min(6, Math.max(1, Number(window.prompt(t("tableColumns"), "3")) || 0));
      const rows = Math.min(20, Math.max(1, Number(window.prompt(t("tableRows"), "2")) || 0));
      if (!columns || !rows) return;
      const head = `<tr>${"<th>Heading</th>".repeat(columns)}</tr>`;
      const body = `<tr>${"<td>Cell</td>".repeat(columns)}</tr>`.repeat(rows);
      insertHtml(`<table><thead>${head}</thead><tbody>${body}</tbody></table><p></p>`);
    } else if (item.value) {
      editor.current?.focus();
      document.execCommand(item.command, false, item.value);
      sync();
    } else {
      editor.current?.focus();
      document.execCommand(item.command, false);
      sync();
    }
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const kind = pending;
    event.target.value = "";
    setPending(null);
    if (!file || !kind) return;
    try {
      const url = await uploadFile(file);
      if (kind === "image") insertHtml(`<figure><img src="${escape(url)}" alt="${escape(file.name)}"></figure>`);
      else insertHtml(`<p><a href="${escape(url)}" data-variant="button">Download ${escape(file.name)}</a></p>`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t("uploadFailed"));
    }
  }

  function paste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
    sync();
  }

  const editorClass =
    size === "compact"
      ? "rich-editor min-h-[7.5rem] w-full px-3 py-2.5 text-[18px] leading-[1.55] text-text outline-none empty:before:text-muted empty:before:content-[attr(data-placeholder)] sm:min-h-24 sm:text-[15px]"
      : "rich-editor min-h-44 w-full px-3 py-3 text-[15px] leading-7 text-text outline-none empty:before:text-muted empty:before:content-[attr(data-placeholder)]";

  return (
    <div>
      {label ? (
        <label className="mb-1 block text-[13px] font-semibold text-text" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className={`overflow-hidden border border-rule bg-white focus-within:border-link ${label ? "mt-1" : ""}`}>
        <div role="toolbar" aria-label={t("toolbar")} className="flex flex-wrap items-center gap-y-1 border-b border-rule bg-panel-head px-2 py-1.5">
          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-center gap-0.5 border-e border-rule px-1.5 last:border-e-0">
              {group.map((item) => (
                <button
                  key={`${item.command}-${item.value ?? ""}-${item.caption}`}
                  type="button"
                  title={item.caption}
                  aria-label={item.caption}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => run(item)}
                  className="flex h-7 min-w-7 items-center justify-center px-1.5 text-muted transition hover:bg-white hover:text-text"
                >
                  {item.content}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div
          id={id}
          ref={editor}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={label ?? placeholder}
          data-placeholder={placeholder}
          onInput={sync}
          onPaste={paste}
          className={editorClass}
        />
        {notice ? (
          <p role="alert" className="border-t border-new/30 bg-[#fdf2f2] px-3 py-2 text-[13px] text-new">
            {notice}
          </p>
        ) : null}
        <input
          ref={fileInput}
          type="file"
          accept={pending === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "application/pdf,image/jpeg,image/png,image/webp,image/gif"}
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
