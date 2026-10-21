import { useState } from "react";
import { Gem } from "lucide-react";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  loading?: "eager" | "lazy";
}

export function ProductImage({
  src,
  alt,
  className = "",
  imageClassName = "size-full object-cover",
  loading = "lazy",
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState("");
  const imageFailed = !src || failedSrc === src;

  return (
    <div className={`relative ${className}`}>
      {imageFailed ? (
        <div className="grid size-full place-items-center bg-gradient-to-br from-[#f8f5f0] to-[#eee8ef] text-[#816c87]" role="img" aria-label={`${alt}: image unavailable`}>
          <span className="flex flex-col items-center gap-2 text-center text-[10px] tracking-wide">
            <Gem size={24} strokeWidth={1.25} aria-hidden="true" />
            Image unavailable
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailedSrc(src || "")}
          className={imageClassName}
        />
      )}
    </div>
  );
}
