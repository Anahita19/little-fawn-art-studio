import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  alt?: boolean;
  tape?: boolean;
  tapeRight?: boolean;
  lift?: boolean;
  style?: CSSProperties;
}

export function Card({ children, className, alt, tape, tapeRight, lift, style }: CardProps) {
  const classes = [
    "paper-card",
    alt ? "paper-card-alt" : "",
    tape ? "tape" : "",
    tapeRight ? "tape-right" : "",
    lift ? "paper-card-lift" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
