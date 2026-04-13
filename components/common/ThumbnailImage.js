"use client";

import { useMemo, useState } from "react";
import { getThumbnailPreviewUrl } from "@/lib/thumbnailUrl";

function getInitials(label) {
  const words = (label || "")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return "IH";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
}

export default function ThumbnailImage({ src, alt, label, className = "h-28 w-full", wrapperClassName = "mb-3" }) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = getThumbnailPreviewUrl(src);
  const initials = useMemo(() => getInitials(label), [label]);

  return (
    <div className={`${wrapperClassName} overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm`}>
      {resolvedSrc && !hasError ? (
        <img
          src={resolvedSrc}
          alt={alt}
          className={`${className} object-cover`}
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className={`${className} flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200`}>
          <span className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}

