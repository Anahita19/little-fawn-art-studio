import { useState } from "react";
import { FawnMark } from "./brand/FawnMark";

interface IllustrationProps {
  src: string;
  alt?: string;
  className?: string;
  fit?: "cover" | "contain";
}

/** Decorative image that degrades to a crayon fawn block if the asset fails. */
export function Illustration({ src, alt = "", className, fit = "cover" }: IllustrationProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[#FBE9CF] ${className ?? ""}`}
        aria-hidden="true"
      >
        <FawnMark className="h-1/3 w-1/3 opacity-60" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
      style={{ objectFit: fit }}
    />
  );
}