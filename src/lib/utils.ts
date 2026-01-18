import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isWindows(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /Win/i.test(navigator.platform) || /Windows/i.test(navigator.userAgent)
  );
}

/**
 * Convert ISO_A2 country code to flag emoji
 * @param code - 2-letter ISO_A2 country code (e.g., "US", "GB")
 * @returns Flag emoji string or empty string if code is invalid
 */
export function getCountryFlagEmoji(code: string): string {
  // Handle edge cases: SYN_ prefixed codes or invalid codes
  if (!code || code.length !== 2 || code.startsWith("SYN_")) {
    return "";
  }

  // Convert each letter to regional indicator symbol
  // 'A' = U+1F1E6, 'B' = U+1F1E7, ..., 'Z' = U+1F1FF
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 0x1f1e6 + (char.charCodeAt(0) - 65));

  // Check if all characters are valid letters
  if (codePoints.some((cp) => cp < 0x1f1e6 || cp > 0x1f1ff)) {
    return "";
  }

  return String.fromCodePoint(...codePoints);
}
