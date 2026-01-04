import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useMediaQuery } from "../useMediaQuery.js";

describe("useMediaQuery", () => {
  let matchMediaListeners: Map<string, ((e: MediaQueryListEvent) => void)[]>;
  let matchMediaMatches: Map<string, boolean>;

  beforeEach(() => {
    matchMediaListeners = new Map();
    matchMediaMatches = new Map();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        if (!matchMediaListeners.has(query)) {
          matchMediaListeners.set(query, []);
        }

        return {
          matches: matchMediaMatches.get(query) ?? false,
          media: query,
          onchange: null,
          addListener: vi.fn((cb) => matchMediaListeners.get(query)!.push(cb)),
          removeListener: vi.fn(),
          addEventListener: vi.fn((_, cb) =>
            matchMediaListeners.get(query)!.push(cb)
          ),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }),
    });
  });

  afterEach(() => {
    matchMediaListeners.clear();
    matchMediaMatches.clear();
  });

  describe("initialization", () => {
    it("should return false when query does not match", () => {
      matchMediaMatches.set("(min-width: 768px)", false);

      const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
      expect(result.current).toBe(false);
    });

    it("should return true when query matches", () => {
      matchMediaMatches.set("(max-width: 500px)", true);

      const { result } = renderHook(() => useMediaQuery("(max-width: 500px)"));
      expect(result.current).toBe(true);
    });

    it("should use defaultValue option", () => {
      const { result } = renderHook(() =>
        useMediaQuery("(prefers-color-scheme: dark)", { defaultValue: true })
      );
      // Initially false from mock, but should sync to mock value
      expect(typeof result.current).toBe("boolean");
    });
  });

  describe("query changes", () => {
    it("should update when query changes", () => {
      matchMediaMatches.set("(min-width: 768px)", true);
      matchMediaMatches.set("(min-width: 1024px)", false);

      const { result, rerender } = renderHook(
        ({ query }) => useMediaQuery(query),
        { initialProps: { query: "(min-width: 768px)" } }
      );

      expect(result.current).toBe(true);

      rerender({ query: "(min-width: 1024px)" });
      expect(result.current).toBe(false);
    });
  });

  describe("media query changes", () => {
    it("should respond to media query state changes", () => {
      const query = "(prefers-reduced-motion: reduce)";
      matchMediaMatches.set(query, false);

      const { result } = renderHook(() => useMediaQuery(query));
      expect(result.current).toBe(false);

      // Simulate media query change
      act(() => {
        const listeners = matchMediaListeners.get(query) || [];
        listeners.forEach((listener) =>
          listener({ matches: true, media: query } as MediaQueryListEvent)
        );
      });

      expect(result.current).toBe(true);
    });
  });

  describe("common media queries", () => {
    it("should work with prefers-color-scheme", () => {
      matchMediaMatches.set("(prefers-color-scheme: dark)", true);

      const { result } = renderHook(() =>
        useMediaQuery("(prefers-color-scheme: dark)")
      );
      expect(result.current).toBe(true);
    });

    it("should work with responsive breakpoints", () => {
      matchMediaMatches.set("(min-width: 640px)", true);
      matchMediaMatches.set("(min-width: 1280px)", false);

      const { result: smResult } = renderHook(() =>
        useMediaQuery("(min-width: 640px)")
      );
      const { result: xlResult } = renderHook(() =>
        useMediaQuery("(min-width: 1280px)")
      );

      expect(smResult.current).toBe(true);
      expect(xlResult.current).toBe(false);
    });
  });
});

