import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounceCallback } from "../useDebounceCallback.js";

describe("useDebounceCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("basic debouncing", () => {
    it("should debounce callback", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 100));

      act(() => {
        result.current.debouncedCallback("a");
        result.current.debouncedCallback("b");
        result.current.debouncedCallback("c");
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("c");
    });

    it("should use latest callback reference", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const { result, rerender } = renderHook(
        ({ cb }) => useDebounceCallback(cb, 100),
        { initialProps: { cb: callback1 } }
      );

      act(() => {
        result.current.debouncedCallback("test");
      });

      rerender({ cb: callback2 });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith("test");
    });
  });

  describe("leading option", () => {
    it("should invoke immediately with leading: true", () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebounceCallback(callback, 100, { leading: true })
      );

      act(() => {
        result.current.debouncedCallback("first");
      });

      expect(callback).toHaveBeenCalledWith("first");
    });
  });

  describe("trailing option", () => {
    it("should not invoke trailing when trailing: false", () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebounceCallback(callback, 100, { leading: false, trailing: false })
      );

      act(() => {
        result.current.debouncedCallback("first");
        result.current.debouncedCallback("second");
      });

      // With both leading and trailing false, nothing should be called
      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Still nothing
      expect(callback).not.toHaveBeenCalled();
    });

    it("should invoke on leading edge only with leading: true, trailing: false", () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebounceCallback(callback, 100, { leading: true, trailing: false })
      );

      act(() => {
        result.current.debouncedCallback("first");
      });

      // Leading edge fires immediately
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("first");

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // No trailing call
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("cancel", () => {
    it("should cancel pending invocation", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 100));

      act(() => {
        result.current.debouncedCallback("test");
      });

      act(() => {
        result.current.cancel();
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("flush", () => {
    it("should immediately invoke pending callback", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 100));

      act(() => {
        result.current.debouncedCallback("flush-me");
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        result.current.flush();
      });

      expect(callback).toHaveBeenCalledWith("flush-me");
    });

    it("should do nothing if no pending callback", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 100));

      act(() => {
        result.current.flush();
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("callback stability", () => {
    it("should maintain stable function references", () => {
      const callback = vi.fn();
      const { result, rerender } = renderHook(() =>
        useDebounceCallback(callback, 100)
      );

      const initial = result.current;
      rerender();

      expect(result.current.debouncedCallback).toBe(initial.debouncedCallback);
      expect(result.current.cancel).toBe(initial.cancel);
      expect(result.current.flush).toBe(initial.flush);
    });
  });
});

