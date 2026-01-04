import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCopyToClipboard } from "../useCopyToClipboard.js";

describe("useCopyToClipboard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initialization", () => {
    it("should initialize with null copiedText", () => {
      const { result } = renderHook(() => useCopyToClipboard());
      expect(result.current.copiedText).toBeNull();
    });

    it("should report clipboard support", () => {
      const { result } = renderHook(() => useCopyToClipboard());
      expect(result.current.isSupported).toBe(true);
    });
  });

  describe("copy", () => {
    it("should copy text to clipboard", async () => {
      const { result } = renderHook(() => useCopyToClipboard());

      await act(async () => {
        const success = await result.current.copy("test text");
        expect(success).toBe(true);
      });

      expect(result.current.copiedText).toBe("test text");
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test text");
    });

    it("should update copiedText after successful copy", async () => {
      const { result } = renderHook(() => useCopyToClipboard());

      await act(async () => {
        await result.current.copy("hello world");
      });

      expect(result.current.copiedText).toBe("hello world");
    });

    it("should reset copiedText after delay", async () => {
      const { result } = renderHook(() =>
        useCopyToClipboard({ resetDelay: 1000 })
      );

      await act(async () => {
        await result.current.copy("temporary");
      });

      expect(result.current.copiedText).toBe("temporary");

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.copiedText).toBeNull();
    });

    it("should use custom reset delay", async () => {
      const { result } = renderHook(() =>
        useCopyToClipboard({ resetDelay: 5000 })
      );

      await act(async () => {
        await result.current.copy("text");
      });

      await act(async () => {
        vi.advanceTimersByTime(4000);
      });
      expect(result.current.copiedText).toBe("text");

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.copiedText).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should return false when clipboard write fails", async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
        new Error("Failed")
      );

      const { result } = renderHook(() => useCopyToClipboard());

      await act(async () => {
        const success = await result.current.copy("will fail");
        expect(success).toBe(false);
      });
    });
  });

  describe("callback stability", () => {
    it("should maintain stable copy function reference", () => {
      const { result, rerender } = renderHook(() => useCopyToClipboard());

      const initialCopy = result.current.copy;
      rerender();

      expect(result.current.copy).toBe(initialCopy);
    });
  });
});

