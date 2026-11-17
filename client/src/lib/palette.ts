/** Small colour helpers used to derive tint / deep / soft variants per class. */

import type { CSSProperties } from "react";

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function mix(hex: string, target: string, amount: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
}

function rgbToHsl({ r, g, b }: Rgb): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  if (s === 0) {
    const v = Math.round(l * 255);
    return rgbToHex({ r: v, g: v, b: v });
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return rgbToHex({
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255,
  });
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Vivid, on-hue crayon version used for borders, dots and text accents. */
export function deepTint(hex: string): string {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return hslToHex(h, clamp(s * 1.12 + 0.16, 0, 1), clamp(l * 0.56, 0.27, 0.56));
}

/** Pale wash used for hover surfaces and soft backgrounds. */
export function softTint(hex: string): string {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return hslToHex(h, clamp(s * 0.82, 0, 1), clamp(l + (1 - l) * 0.62, 0, 0.98));
}

export function tintVars(hex: string): CSSProperties {
  return {
    ["--tint" as string]: hex,
    ["--tint-deep" as string]: deepTint(hex),
    ["--tint-soft" as string]: softTint(hex),
  };
}

/** 23 distinct macaron pastels — one per weekly class. */
export const CLASS_TINTS: string[] = [
  "#F7C2CE",
  "#F9CFC2",
  "#FBD9B6",
  "#FBE3AE",
  "#F5ECA6",
  "#E4EDA6",
  "#CFE8AE",
  "#BCE3BC",
  "#B4E4CC",
  "#B4E5DC",
  "#B6E1E8",
  "#BCD9EF",
  "#C6D2F2",
  "#D0CBF2",
  "#DCC9F0",
  "#EBC9E8",
  "#F3C9DE",
  "#F6CBCB",
  "#EBD3C3",
  "#DDD5C0",
  "#CDD8CB",
  "#C9D9E3",
  "#D9CEDA",
];

export const AVATAR_TINTS: string[] = [
  "#F8C9B8",
  "#F9D9A6",
  "#E9E3A0",
  "#C6E3B4",
  "#B3E2D2",
  "#B7DDF0",
  "#C9CFF0",
  "#DFC9EC",
  "#F3C8D8",
  "#F0CFC0",
  "#D6DCC4",
  "#CBD9E6",
];
