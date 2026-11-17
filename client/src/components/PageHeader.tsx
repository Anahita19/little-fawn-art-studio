import type { ReactNode } from "react";
import { Card } from "./Card";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  underline?: "fawn" | "mint";
}

export function PageHeader({ eyebrow, title, subtitle, actions, underline = "fawn" }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-ink-soft">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-fawn" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[27px] leading-[1.1] sm:text-[34px] lg:text-[38px]">
          <span className={underline === "mint" ? "crayon-underline crayon-underline-mint" : "crayon-underline"}>
            {title}
          </span>
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-[13px] font-semibold leading-relaxed text-ink-soft sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tint: string;
  icon?: ReactNode;
  index?: number;
}

export function StatCard({ label, value, hint, tint, icon, index = 0 }: StatCardProps) {
  return (
    <Card
      alt={index % 2 === 1}
      className="rise-in relative overflow-hidden p-3.5"
      style={{ ["--i" as string]: index }}
    >
      <div
        className="pointer-events-none absolute -end-6 -top-6 h-16 w-16 rounded-full opacity-70"
        style={{ background: tint }}
      />
      <div className="relative flex items-center gap-2">
        {icon && (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-[9px] border-2 border-ink/10"
            style={{ background: tint }}
          >
            {icon}
          </span>
        )}
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      </div>
      <p className="relative mt-1.5 font-display text-[26px] font-extrabold leading-none">{value}</p>
      {hint && <p className="relative mt-1 text-[10.5px] font-semibold leading-snug text-ink-soft">{hint}</p>}
    </Card>
  );
}
