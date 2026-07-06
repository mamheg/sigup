import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { mediaUrl } from "../../lib/media";
import Input from "./Input";

// A broken preview collapses instead of showing a torn-image icon.
const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.opacity = "0");

export interface ImageInputProps {
  /** Current image URL (backend-relative "/static/…" or absolute). */
  value: string;
  /** Fired when the URL changes — via typing OR after an upload. */
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

/**
 * Dual-source image field: paste a URL OR «Загрузить с компьютера». Both paths
 * write the same `value`. Uploads go through api.cabinet.uploadImage → { url }.
 */
export default function ImageInput({ value, onChange, label, placeholder = "Ссылка на изображение (URL)" }: ImageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Выберите файл изображения.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api.cabinet.uploadImage(file);
      onChange(res.url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось загрузить изображение");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const preview = mediaUrl(value.trim());

  return (
    <div className="block">
      {label && <span className="block mb-1.5 text-sm font-medium text-ink">{label}</span>}
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 shrink-0 rounded-sm bg-canvas border border-line overflow-hidden img-outline flex items-center justify-center text-line-strong">
          {preview ? (
            <img key={preview} src={preview} alt="" onError={hideBroken} className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-sm border border-line bg-surface text-sm font-medium text-ink-soft hover:text-ink hover:border-line-strong transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.96]"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Загрузить с компьютера
            </button>
            {value.trim() && !busy && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs font-medium text-ink-faint hover:text-red-600 transition-colors cursor-pointer"
              >
                Убрать
              </button>
            )}
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} className="hidden" />
      </div>
    </div>
  );
}
