"use client";

/* eslint-disable @next/next/no-img-element -- previews point at the Parse file host */
import { useState } from "react";
import { useTranslations } from "next-intl";
import { uploadAdminImage } from "@/lib/client-upload";
import { IconUpload } from "@/components/ui/Icons";
import { Loader } from "@/components/ui/Loader";

export function ImageUploader() {
  const t = useTranslations("dashboard.upload");
  const [status, setStatus] = useState<{ kind: "idle" | "pending" | "done" | "error"; message?: string; url?: string }>({ kind: "idle" });

  async function upload(file: File) {
    setStatus({ kind: "pending" });
    try {
      const url = await uploadAdminImage(file);
      setStatus({ kind: "done", url });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : t("error") });
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-rule bg-white px-6 py-10 text-center hover:border-link">
        {status.kind === "pending" ? <Loader size={28} /> : <IconUpload className="size-7 text-muted" />}
        <span className="text-[15px] font-semibold text-text">{status.kind === "pending" ? t("uploading") : t("choose")}</span>
        <span className="text-[13px] text-muted">{t("hint")}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={status.kind === "pending"}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
      </label>

      {status.kind === "error" && (
        <p role="alert" className="border-s-4 border-new bg-white px-3 py-2 text-[14px] text-new">{status.message}</p>
      )}
      {status.kind === "done" && status.url && (
        <div className="flex gap-4 bg-white p-3">
          <img src={status.url} alt="" className="h-24 w-24 object-cover" />
          <div className="min-w-0 text-[13px]">
            <p className="mb-1 font-semibold text-text">{t("done")}</p>
            <input readOnly value={status.url} onFocus={(event) => event.currentTarget.select()} className="w-full border border-rule px-2 py-1 font-mono text-[12px]" />
          </div>
        </div>
      )}
    </div>
  );
}
