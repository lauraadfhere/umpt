"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

type Props = {
  id: string;
  label?: string;
  placeholder: string;
  value: string;
  onChange: (html: string) => void;
};

export function CompactRichTextEditor({ id, label, placeholder, value, onChange }: Props) {
  const t = useTranslations("dashboard.editor");
  const editor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync() {
    onChange(editor.current?.innerHTML ?? "");
  }

  function run(command: string, value?: string) {
    editor.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function addLink() {
    editor.current?.focus();
    const url = window.prompt(t("link"), "https://");
    if (!url || !/^https?:\/\//i.test(url.trim())) return;
    document.execCommand("createLink", false, url.trim());
    sync();
  }

  function paste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
    sync();
  }

  return (
    <div>
      {label ? (
        <label className="mb-1 block text-[13px] font-semibold text-text" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className="overflow-hidden border border-rule bg-white focus-within:border-link">
        <div role="toolbar" aria-label={t("toolbar")} className="flex flex-wrap items-center gap-1 border-b border-rule bg-panel-head px-2 py-1.5">
          <button
            type="button"
            title={t("bold")}
            aria-label={t("bold")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => run("bold")}
            className="flex h-8 min-w-8 touch-manipulation items-center justify-center px-1.5 text-muted hover:bg-white hover:text-text"
          >
            <span className="text-[15px] font-bold">B</span>
          </button>
          <button
            type="button"
            title={t("italic")}
            aria-label={t("italic")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => run("italic")}
            className="flex h-8 min-w-8 touch-manipulation items-center justify-center px-1.5 text-muted hover:bg-white hover:text-text"
          >
            <span className="text-[15px] italic">I</span>
          </button>
          <button
            type="button"
            title={t("underline")}
            aria-label={t("underline")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => run("underline")}
            className="flex h-8 min-w-8 touch-manipulation items-center justify-center px-1.5 text-muted hover:bg-white hover:text-text"
          >
            <span className="text-[15px] underline">U</span>
          </button>
          <button
            type="button"
            title={t("link")}
            aria-label={t("link")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={addLink}
            className="flex h-8 min-w-8 touch-manipulation items-center justify-center px-1.5 text-muted hover:bg-white hover:text-text"
          >
            <span className="text-[12px] font-semibold">Link</span>
          </button>
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
          className="rich-editor min-h-[7.5rem] w-full px-3 py-2.5 text-[18px] leading-[1.55] text-text outline-none empty:before:text-muted empty:before:content-[attr(data-placeholder)] sm:min-h-24 sm:text-[15px]"
        />
      </div>
    </div>
  );
}