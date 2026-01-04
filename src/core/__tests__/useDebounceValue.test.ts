import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounceValue } from "../useDebounceValue.js";

describe("useDebounceValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("basic debouncing", () => {
    it("should return initial value immediately", () => {
      const { result } = renderHook(() => useDebounceValue("initial", 100));
      expect(result.current).toBe("initial");
    });

    it("should debounce value changes", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounceValue(value, 100),
        { initialProps: { value: "first" } }
      );

      expect(result.current).toBe("first");

      rerender({ value: "second" });
      expect(result.current).toBe("first");

      rerender({ value: "third" });
      expect(result.current).toBe("first");

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toBe("third");
    });

    it("should handle rapid value changes", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounceValue(value, 200),
        { initialProps: { value: 0 } }
      );

      for (let i = 1; i <= 10; i++) {
        rerender({ value: i });
        act(() => {
          vi.advanceTimersByTime(50);
        });
      }

      // Still showing old value during debounce
      expect(result.current).toBe(0);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current).toBe(10);
    });
  });

  describe("with different types", () => {
    it("should work with objects", () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };

      const { result, rerender } = renderHook(
        ({ value }) => useDebounceValue(value, 100),
        { initialProps: { value: obj1 } }
      );

      expect(result.current).toBe(obj1);

      rerender({ value: obj2 });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toBe(obj2);
    });

    it("should work with arrays", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounceValue(value, 100),
        { initialProps: { value: [1, 2, 3] } }
      );

      const newArray = [4, 5, 6];
      rerender({ value: newArray });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toEqual([4, 5, 6]);
    });
  });

  describe("delay changes", () => {
    it("should respect delay value", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounceValue(value, delay),
        { initialProps: { value: "start", delay: 500 } }
      );

      rerender({ value: "end", delay: 500 });

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(result.current).toBe("start");

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current).toBe("end");
    });
  });
});

