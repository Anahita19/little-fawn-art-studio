import { useState } from "react";
import { Palette } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import type { Artwork } from "@/lib/types";
import { formatDateShort } from "@/lib/time";

interface ArtworkThumbProps {
  artwork: Artwork;
  tilt?: number;
  className?: string;
  showCaption?: boolean;
  onClick?: () => void;
}

export function ArtworkThumb({ artwork, tilt = 0, className, showCaption = false, onClick }: ArtworkThumbProps) {
  const { tr, lang } = useI18n();
  const [failed, setFailed] = useState(false);
  const Wrapper = onClick ? "button" : "figure";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`group block text-start ${className ?? ""}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <span className="block overflow-hidden rounded-[12px] border-2 border-line bg-white p-[3px] shadow-[0_2px_0_rgba(63,52,43,0.08)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_18px_-12px_rgba(63,52,43,0.6)]">
        {failed ? (
          <span className="flex aspect-square w-full items-center justify-center rounded-[8px] bg-[#FBE9CF] text-[#C08A4A]">
            <Palette size={22} strokeWidth={2.4} />
          </span>
        ) : (
          <img
            src={artwork.image}
            alt={tr(artwork.title)}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="aspect-square w-full rounded-[8px] object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        )}
      </span>
      {showCaption && (
        <span className="mt-1.5 block truncate text-[11px] font-bold text-ink">
          {tr(artwork.title)}
          <span className="block text-[10px] font-semibold text-ink-soft">
            {formatDateShort(artwork.date, lang)} · {tr(artwork.medium)}
          </span>
        </span>
      )}
    </Wrapper>
  );
}
