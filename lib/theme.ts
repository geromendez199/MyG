// lib/theme.ts
export function hexToRgbSpaces(hex: string, fallback = "#ff1a1a") {
  const h = (hex || fallback).replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`; // formato "r g b"
}
