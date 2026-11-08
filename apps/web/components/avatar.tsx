"use client";

import { useEffect, useState } from "react";

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  fallback?: string | null;
  alt: string;
  className: string;
  imageClassName?: string;
};

export function Avatar({
  src,
  name,
  fallback,
  alt,
  className,
  imageClassName = "size-full object-cover",
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = (name?.trim().charAt(0) || fallback?.trim().charAt(0) || "?").toUpperCase();

  useEffect(() => setImageFailed(false), [src]);

  return (
    <div className={className}>
      {src && !imageFailed ? (
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          onError={() => setImageFailed(true)}
        />
      ) : (
        initial
      )}
    </div>
  );
}
