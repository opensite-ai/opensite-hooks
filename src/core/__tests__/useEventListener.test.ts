import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEventListener } from "../useEventListener.js";

describe("useEventListener", () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  describe("window events", () => {
    it("should add event listener on mount", () => {
      const handler = vi.fn();
      renderHook(() => useEventListener("click", handler));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        undefined
      );
    });

    it("should remove event listener on unmount", () => {
      const handler = vi.fn();
      const { unmount } = renderHook(() => useEventListener("click", handler));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        undefined
      );
    });

    it("should call handler when event is fired", () => {
      const handler = vi.fn();
      renderHook(() => useEventListener("click", handler));

      const event = new MouseEvent("click");
      window.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should use latest handler reference", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const { rerender } = renderHook(
        ({ handler }) => useEventListener("click", handler),
        { initialProps: { handler: handler1 } }
      );

      rerender({ handler: handler2 });

      const event = new MouseEvent("click");
      window.dispatchEvent(event);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe("with options", () => {
    it("should pass options to addEventListener", () => {
      const handler = vi.fn();
      const options = { passive: true, capture: true };

      renderHook(() => useEventListener("scroll", handler, undefined, options));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
        options
      );
    });
  });

  describe("element ref events", () => {
    it("should add listener to element via ref", () => {
      const handler = vi.fn();
      const element = document.createElement("div");
      const ref = { current: element };

      renderHook(() => useEventListener("click", handler, ref));

      const event = new MouseEvent("click");
      element.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should handle null ref gracefully", () => {
      const handler = vi.fn();
      const ref = { current: null };

      // Should not throw
      expect(() => {
        renderHook(() => useEventListener("click", handler, ref));
      }).not.toThrow();
    });
  });
});

