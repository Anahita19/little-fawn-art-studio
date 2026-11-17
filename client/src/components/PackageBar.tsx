import { useI18n } from "@/i18n/LanguageProvider";
import { PACKAGE_SIZE, packageState } from "@/lib/types";

interface PackageBarProps {
  remaining: number;
  total?: number;
  showLabel?: boolean;
  showTicks?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const COLORS = {
  healthy: { fill: "#7BBE8C", glow: "rgba(123,190,140,0.35)" },
  low: { fill: "#EF8B34", glow: "rgba(239,139,52,0.35)" },
  empty: { fill: "#E4766A", glow: "rgba(228,118,106,0.35)" },
};

export function PackageBar({
  remaining,
  total,
  showLabel = true,
  showTicks = true,
  size = "md",
  className,
}: PackageBarProps) {
  const { t, n } = useI18n();
  const state = packageState(remaining);
  const colors = COLORS[state];
  const denom = Math.max(PACKAGE_SIZE, total ?? PACKAGE_SIZE);
  const pct = Math.max(0, Math.min(100, (remaining / denom) * 100));
  const height = size === "sm" ? 9 : 13;

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">
            {t("common.remaining")}
          </span>
          <span
            className="font-display text-[15px] font-extrabold leading-none"
            style={{ color: colors.fill }}
          >
            {n(remaining)}
            <span className="ms-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
              {t("common.lessons")}
            </span>
          </span>
        </div>
      )}
      <div
        className="progress-track"
        style={{ height, boxShadow: `inset 0 1px 2px rgba(63,52,43,.14), 0 0 0 3px ${colors.glow}22` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={denom}
        aria-valuenow={remaining}
        aria-label={`${remaining} ${t("common.lessons")}`}
      >
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, backgroundColor: colors.fill }}
        />
        {showTicks && <div className="progress-ticks" />}
      </div>
    </div>
  );
}

export function packageColor(remaining: number): string {
  return COLORS[packageState(remaining)].fill;
}
