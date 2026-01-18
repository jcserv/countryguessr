import { describe, expect, it } from "vitest";

import { cn, getCountryFlagEmoji } from "./utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names", () => {
      const result = cn("foo", "bar");
      expect(result).toContain("foo");
      expect(result).toContain("bar");
    });

    it("handles conditional classes", () => {
      const shouldHide = false;
      const shouldShow = true;
      const result = cn(
        "base",
        shouldHide && "hidden",
        shouldShow && "visible",
      );
      expect(result).toContain("base");
      expect(result).toContain("visible");
      expect(result).not.toContain("hidden");
    });

    it("handles undefined and null values", () => {
      const result = cn("base", undefined, null, "end");
      expect(result).toBe("base end");
    });

    it("merges tailwind classes correctly", () => {
      // twMerge should handle conflicting utilities
      const result = cn("p-4", "p-2");
      expect(result).toBe("p-2");
    });

    it("handles empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });
  });

  describe("getCountryFlagEmoji", () => {
    it("converts US to flag emoji", () => {
      const flag = getCountryFlagEmoji("US");
      expect(flag).toBe("🇺🇸");
    });

    it("converts GB to flag emoji", () => {
      const flag = getCountryFlagEmoji("GB");
      expect(flag).toBe("🇬🇧");
    });

    it("converts lowercase code to flag emoji", () => {
      const flag = getCountryFlagEmoji("fr");
      expect(flag).toBe("🇫🇷");
    });

    it("converts JP to flag emoji", () => {
      const flag = getCountryFlagEmoji("JP");
      expect(flag).toBe("🇯🇵");
    });

    it("returns empty string for empty code", () => {
      const flag = getCountryFlagEmoji("");
      expect(flag).toBe("");
    });

    it("returns empty string for invalid length code", () => {
      expect(getCountryFlagEmoji("A")).toBe("");
      expect(getCountryFlagEmoji("USA")).toBe("");
    });

    it("returns empty string for SYN_ prefixed codes", () => {
      const flag = getCountryFlagEmoji("SYN_NORTHERN_CYPRUS");
      expect(flag).toBe("");
    });

    it("returns empty string for invalid characters", () => {
      const flag = getCountryFlagEmoji("12");
      expect(flag).toBe("");
    });
  });
});
