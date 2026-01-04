import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useThrottle } from "../useThrottle.js";

describe("useThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("basic throttling", () => {
    it("should return initial value immediately with leading: true (default)", () => {
      const { result } = renderHook(() => useThrottle("initial", 100));
      expect(result.current).toBe("initial");
    });

    it("should throttle rapid value changes", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 100),
        { initialProps: { value: "first" } }
      );

      expect(result.current).toBe("first");

      rerender({ value: "second" });
      // Value shouldn't change immediately due to throttle
      expect(result.current).toBe("first");

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toBe("second");
    });

    it("should pass through immediately when interval is 0", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 0),
        { initialProps: { value: "a" } }
      );

      expect(result.current).toBe("a");

      rerender({ value: "b" });
      expect(result.current).toBe("b");

      rerender({ value: "c" });
      expect(result.current).toBe("c");
    });
  });

  describe("leading option", () => {
    it("should emit first value immediately with leading: true", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 100, { leading: true }),
        { initialProps: { value: "start" } }
      );

      expect(result.current).toBe("start");

      // Simulate time passing for new throttle window
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: "next" });
      expect(result.current).toBe("next");
    });
  });

  describe("trailing option", () => {
    it("should emit last value after interval with trailing: true", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 100, { leading: true, trailing: true }),
        { initialProps: { value: "a" } }
      );

      expect(result.current).toBe("a");

      rerender({ value: "b" });
      rerender({ value: "c" });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toBe("c");
    });
  });

  describe("with numbers", () => {
    it("should throttle numeric values", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 50),
        { initialProps: { value: 0 } }
      );

      expect(result.current).toBe(0);

      for (let i = 1; i <= 5; i++) {
        rerender({ value: i });
      }

      // Should still be 0 (throttled)
      expect(result.current).toBe(0);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Should now have the last value
      expect(result.current).toBe(5);
    });
  });
});

