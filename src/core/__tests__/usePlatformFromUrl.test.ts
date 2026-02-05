import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePlatformFromUrl } from "../usePlatformFromUrl.js";

describe("usePlatformFromUrl", () => {
  describe("initialization", () => {
    it("should return unknown for empty input", () => {
      const { result } = renderHook(() => usePlatformFromUrl(""));
      expect(result.current).toBe("unknown");
    });
  });

  describe("core functionality", () => {
    const cases: Array<[string, string]> = [
      ["https://www.instagram.com/opensite", "instagram"],
      ["https://lnkd.in/abc123", "linkedin"],
      ["https://maps.app.goo.gl/XDuog3V5fTuPcWCH7", "google"],
      ["https://m.facebook.com/opensite", "facebook"],
      ["https://vt.tiktok.com/abc", "tiktok"],
      ["https://youtu.be/abc", "youtube"],
      ["https://www.yelp.com/biz/opensite", "yelp"],
      ["https://open.spotify.com/track/abc", "spotify"],
      ["https://music.apple.com/us/album/abc", "apple"],
      ["https://twitter.com/opensite", "x"],
      ["https://WWW.YOUTUBE.COM/watch?v=abc", "youtube"],
    ];

    cases.forEach(([url, expected]) => {
      it(`should resolve ${expected} for ${url}`, () => {
        const { result } = renderHook(() => usePlatformFromUrl(url));
        expect(result.current).toBe(expected);
      });
    });
  });

  describe("edge cases", () => {
    it("should trim whitespace before parsing", () => {
      const { result } = renderHook(() =>
        usePlatformFromUrl("  https://www.youtube.com/watch?v=abc  ")
      );
      expect(result.current).toBe("youtube");
    });

    it("should return unknown for invalid URLs", () => {
      const { result } = renderHook(() => usePlatformFromUrl("not-a-url"));
      expect(result.current).toBe("unknown");
    });

    it("should return unknown for URLs without protocol", () => {
      const { result } = renderHook(() =>
        usePlatformFromUrl("www.youtube.com/watch?v=abc")
      );
      expect(result.current).toBe("unknown");
    });

    it("should return unknown for unsupported hostnames", () => {
      const { result } = renderHook(() =>
        usePlatformFromUrl("https://example.com")
      );
      expect(result.current).toBe("unknown");
    });

    it("should return unknown for non-string input", () => {
      const { result } = renderHook(() =>
        usePlatformFromUrl((null as unknown) as string)
      );
      expect(result.current).toBe("unknown");
    });
  });

  describe("stability", () => {
    it("should return the same result for the same input across rerenders", () => {
      const { result, rerender } = renderHook(
        ({ url }) => usePlatformFromUrl(url),
        { initialProps: { url: "https://x.com/opensite" } }
      );

      const initial = result.current;

      rerender({ url: "https://x.com/opensite" });

      expect(result.current).toBe(initial);
    });
  });
});
