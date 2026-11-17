import type { ReactNode } from "react";
import type { AnimalKind } from "@/lib/types";
import { softTint } from "@/lib/palette";

const INK = "#3F342B";

interface Palette {
  base: string;
  inner: string;
  accent: string;
}

const PALETTES: Record<AnimalKind, Palette> = {
  fawn: { base: "#D99A5B", inner: "#FBE9CF", accent: "#B4703A" },
  bunny: { base: "#F2E4E6", inner: "#F7C2CE", accent: "#D9A7B3" },
  bear: { base: "#C79A72", inner: "#F3DDC4", accent: "#A87A52" },
  cat: { base: "#F5C98A", inner: "#FBEBD2", accent: "#D8A25A" },
  fox: { base: "#EE9A5F", inner: "#FFF3E2", accent: "#C9763C" },
  owl: { base: "#B7D3E6", inner: "#FFFDF6", accent: "#E8B45E" },
  chick: { base: "#F8DE8C", inner: "#FFF6DA", accent: "#E8963E" },
  panda: { base: "#FBF6EC", inner: "#FFFDF8", accent: "#4A4038" },
  koala: { base: "#C3CED8", inner: "#EFF4F8", accent: "#5B4B40" },
  mouse: { base: "#D9C8D9", inner: "#F5E9F2", accent: "#B98FA8" },
  hedgehog: { base: "#E0C3A4", inner: "#F7E7D3", accent: "#9C7A56" },
  frog: { base: "#A9D6A0", inner: "#E6F4DE", accent: "#6FA968" },
};

function earsFor(animal: AnimalKind, p: Palette): ReactNode {
  switch (animal) {
    case "fawn":
      return (
        <>
          <path d="M24 15c-2.2-3.4-2.4-6.2-0.7-8.6" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <path d="M40 15c2.2-3.4 2.4-6.2 0.7-8.6" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="16.5" cy="21.5" rx="7" ry="4.1" transform="rotate(-28 16.5 21.5)" fill={p.base} stroke={INK} strokeWidth="2" />
          <ellipse cx="47.5" cy="21.5" rx="7" ry="4.1" transform="rotate(28 47.5 21.5)" fill={p.base} stroke={INK} strokeWidth="2" />
        </>
      );
    case "bunny":
      return (
        <>
          <ellipse cx="23" cy="13" rx="4.6" ry="11" transform="rotate(-8 23 13)" fill={p.base} stroke={INK} strokeWidth="2" />
          <ellipse cx="23" cy="14" rx="2.1" ry="7.4" fill={p.inner} />
          <ellipse cx="41" cy="13" rx="4.6" ry="11" transform="rotate(8 41 13)" fill={p.base} stroke={INK} strokeWidth="2" />
          <ellipse cx="41" cy="14" rx="2.1" ry="7.4" fill={p.inner} />
        </>
      );
    case "bear":
      return (
        <>
          <circle cx="15.5" cy="20.5" r="7.2" fill={p.base} stroke={INK} strokeWidth="2" />
          <circle cx="15.5" cy="20.5" r="3.4" fill={p.inner} />
          <circle cx="48.5" cy="20.5" r="7.2" fill={p.base} stroke={INK} strokeWidth="2" />
          <circle cx="48.5" cy="20.5" r="3.4" fill={p.inner} />
        </>
      );
    case "cat":
      return (
        <>
          <path d="M14 26 12.5 9.5 27 18.5Z" fill={p.base} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M50 26 51.5 9.5 37 18.5Z" fill={p.base} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M16.5 17.5 18 14 20 18.5Z" fill={p.inner} />
          <path d="M47.5 17.5 46 14 44 18.5Z" fill={p.inner} />
        </>
      );
    case "fox":
      return (
        <>
          <path d="M13.5 26 11 6.5 28 17.5Z" fill={p.base} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M50.5 26 53 6.5 36 17.5Z" fill={p.base} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M15.6 15.5 17 12 19.5 16Z" fill={p.inner} />
          <path d="M48.4 15.5 47 12 44.5 16Z" fill={p.inner} />
        </>
      );
    case "owl":
      return (
        <>
          <path d="M14.5 23 15 11.5 25.5 19.5" fill={p.base} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M49.5 23 49 11.5 38.5 19.5" fill={p.base} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </>
      );
    case "chick":
      return (
        <>
          <path d="M30 15c-0.6-3.4 1.6-4.6 3-6.4" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <path d="M34 14.6c1.6-2.6 3.4-3 5-2.6" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "panda":
      return (
        <>
          <circle cx="15.5" cy="20.5" r="7" fill={p.accent} stroke={INK} strokeWidth="2" />
          <circle cx="48.5" cy="20.5" r="7" fill={p.accent} stroke={INK} strokeWidth="2" />
        </>
      );
    case "koala":
      return (
        <>
          <circle cx="13.5" cy="22" r="8.4" fill={p.base} stroke={INK} strokeWidth="2" />
          <circle cx="13.5" cy="22" r="4.4" fill={p.inner} />
          <circle cx="50.5" cy="22" r="8.4" fill={p.base} stroke={INK} strokeWidth="2" />
          <circle cx="50.5" cy="22" r="4.4" fill={p.inner} />
        </>
      );
    case "mouse":
      return (
        <>
          <circle cx="13" cy="21" r="9.2" fill={p.base} stroke={INK} strokeWidth="2" />
          <circle cx="13" cy="21" r="5.4" fill={p.inner} />
          <circle cx="51" cy="21" r="9.2" fill={p.base} stroke={INK} strokeWidth="2" />
          <circle cx="51" cy="21" r="5.4" fill={p.inner} />
        </>
      );
    case "hedgehog":
      return (
        <>
          <path
            d="M13 31 14.5 21 19 25.5 21 15 25.5 21.5 29 12.5 32 21 35 12.5 38.5 21.5 43 15 45 25.5 49.5 21 51 31Z"
            fill={p.accent}
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="26" r="4" fill={p.base} stroke={INK} strokeWidth="2" />
          <circle cx="46" cy="26" r="4" fill={p.base} stroke={INK} strokeWidth="2" />
        </>
      );
    case "frog":
      return (
        <>
          <circle cx="22" cy="18" r="7.4" fill={p.base} stroke={INK} strokeWidth="2" />
          <circle cx="42" cy="18" r="7.4" fill={p.base} stroke={INK} strokeWidth="2" />
        </>
      );
    default:
      return null;
  }
}

function faceExtras(animal: AnimalKind, p: Palette): ReactNode {
  switch (animal) {
    case "fawn":
      return (
        <>
          <ellipse cx="32" cy="44" rx="7" ry="4.9" fill={p.inner} stroke={INK} strokeWidth="1.6" />
          <circle cx="26.5" cy="25" r="1.6" fill={p.inner} />
          <circle cx="32" cy="23.4" r="1.4" fill={p.inner} />
          <circle cx="37.5" cy="25" r="1.6" fill={p.inner} />
        </>
      );
    case "fox":
      return (
        <>
          <ellipse cx="32" cy="44" rx="8" ry="5.4" fill={p.inner} />
          <path d="M24 38c2-3 4-4 6-4" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
        </>
      );
    case "panda":
      return (
        <>
          <ellipse cx="24.5" cy="33" rx="5.6" ry="6.4" transform="rotate(-14 24.5 33)" fill={p.accent} />
          <ellipse cx="39.5" cy="33" rx="5.6" ry="6.4" transform="rotate(14 39.5 33)" fill={p.accent} />
          <ellipse cx="32" cy="43" rx="4.6" ry="3.4" fill={p.accent} opacity="0.85" />
        </>
      );
    case "koala":
      return (
        <>
          <ellipse cx="32" cy="39.5" rx="4.6" ry="5.6" fill={p.accent} />
          <ellipse cx="32" cy="37.4" rx="1.6" ry="2.2" fill="#F2E3D6" opacity="0.7" />
        </>
      );
    case "owl":
      return (
        <>
          <circle cx="24.5" cy="32" r="6.6" fill={p.inner} stroke={INK} strokeWidth="1.8" />
          <circle cx="39.5" cy="32" r="6.6" fill={p.inner} stroke={INK} strokeWidth="1.8" />
          <path d="M32 36.5 34 41h-4Z" fill={p.accent} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        </>
      );
    case "chick":
      return (
        <>
          <path d="M28.5 38 32 43.5 35.5 38Z" fill={p.accent} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        </>
      );
    case "frog":
      return (
        <>
          <path d="M24 42c3.4 4.6 12.6 4.6 16 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "hedgehog":
      return (
        <>
          <ellipse cx="32" cy="41.5" rx="6.4" ry="4.6" fill={p.inner} />
          <circle cx="32" cy="39.5" r="1.8" fill={p.accent} />
        </>
      );
    default:
      return null;
  }
}

interface AnimalAvatarProps {
  animal: AnimalKind;
  tint: string;
  size?: number;
  className?: string;
  ring?: boolean;
}

export function AnimalAvatar({ animal, tint, size = 64, className, ring = true }: AnimalAvatarProps) {
  const p = PALETTES[animal] ?? PALETTES.fawn;
  const hasOwnEyes = animal === "owl" || animal === "panda" || animal === "frog";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: softTint(tint),
        border: ring ? "2px solid rgba(63,52,43,0.14)" : undefined,
      }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        <g strokeLinecap="round" strokeLinejoin="round">
          {earsFor(animal, p)}
          <circle cx="32" cy="35" r="18.5" fill={p.base} stroke={INK} strokeWidth="2" />
          {faceExtras(animal, p)}

          {!hasOwnEyes && (
            <>
              <circle cx="25.8" cy="33" r="2.5" fill={INK} />
              <circle cx="38.2" cy="33" r="2.5" fill={INK} />
              <circle cx="26.7" cy="32.2" r="0.9" fill="#FFFDF8" />
              <circle cx="39.1" cy="32.2" r="0.9" fill="#FFFDF8" />
            </>
          )}

          {animal === "owl" && (
            <>
              <circle cx="24.5" cy="32" r="3.1" fill={INK} />
              <circle cx="39.5" cy="32" r="3.1" fill={INK} />
              <circle cx="25.4" cy="31" r="1.1" fill="#FFFDF8" />
              <circle cx="40.4" cy="31" r="1.1" fill="#FFFDF8" />
            </>
          )}

          {animal === "panda" && (
            <>
              <circle cx="25" cy="33" r="2.6" fill="#FFFDF8" />
              <circle cx="39" cy="33" r="2.6" fill="#FFFDF8" />
              <circle cx="25" cy="33" r="1.6" fill={INK} />
              <circle cx="39" cy="33" r="1.6" fill={INK} />
            </>
          )}

          {animal === "frog" && (
            <>
              <circle cx="22" cy="18" r="3.2" fill={INK} />
              <circle cx="42" cy="18" r="3.2" fill={INK} />
              <circle cx="23" cy="17" r="1.1" fill="#FFFDF8" />
              <circle cx="43" cy="17" r="1.1" fill="#FFFDF8" />
            </>
          )}

          {animal !== "panda" && animal !== "koala" && animal !== "owl" && animal !== "frog" && animal !== "chick" && animal !== "hedgehog" && (
            <path d="M29.6 39.4h4.8l-2.4 2.6z" fill={INK} strokeWidth="0" />
          )}

          <ellipse cx="20.5" cy="39.5" rx="3.4" ry="2.2" fill="#F29EA6" opacity="0.5" />
          <ellipse cx="43.5" cy="39.5" rx="3.4" ry="2.2" fill="#F29EA6" opacity="0.5" />
        </g>
      </svg>
    </span>
  );
}
