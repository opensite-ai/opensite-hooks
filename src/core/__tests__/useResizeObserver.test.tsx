import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useResizeObserver } from "../useResizeObserver.js";
import { createResizeObserverEntry } from "../../test/utils.js";

describe("useResizeObserver", () => {
  let observeMock: ReturnType<typeof vi.fn>;
  let unobserveMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;
  let resizeCallback: ResizeObserverCallback;

  beforeEach(() => {
    observeMock = vi.fn();
    unobserveMock = vi.fn();
    disconnectMock = vi.fn();

    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }
      observe = observeMock;
      unobserve = unobserveMock;
      disconnect = disconnectMock;
    }

    Object.defineProperty(window, "ResizeObserver", {
      writable: true,
      value: MockResizeObserver,
    });
  });

  describe("with ref target", () => {
    it("should observe element from ref", () => {
      const element = document.createElement("div");
      const ref = { current: element };

      renderHook(() => useResizeObserver(ref));

      expect(observeMock).toHaveBeenCalledWith(element, undefined);
    });

    it("should disconnect on unmount", () => {
      const element = document.createElement("div");
      const ref = { current: element };

      const { unmount } = renderHook(() => useResizeObserver(ref));
      unmount();

      expect(disconnectMock).toHaveBeenCalled();
    });

    it("should not observe when ref is null", () => {
      const ref = { current: null };

      renderHook(() => useResizeObserver(ref));

      expect(observeMock).not.toHaveBeenCalled();
    });
  });

  describe("with element target", () => {
    it("should observe element directly", () => {
      const element = document.createElement("div");

      renderHook(() => useResizeObserver(element));

      expect(observeMock).toHaveBeenCalledWith(element, undefined);
    });
  });

  describe("with callback", () => {
    it("should call callback on resize", () => {
      const element = document.createElement("div");
      const ref = { current: element };
      const onResize = vi.fn();

      renderHook(() => useResizeObserver(ref, onResize));

      const entry = createResizeObserverEntry(element, 100, 200);
      resizeCallback([entry], {} as ResizeObserver);

      expect(onResize).toHaveBeenCalledWith(entry);
    });
  });

  describe("without callback", () => {
    it("should return entry state", () => {
      const element = document.createElement("div");
      const ref = { current: element };

      const { result } = renderHook(() => useResizeObserver(ref));

      expect(result.current).toBeNull();
    });
  });

  describe("with options", () => {
    it("should pass options to observe", () => {
      const element = document.createElement("div");
      const ref = { current: element };
      const options = { box: "content-box" as ResizeObserverBoxOptions };

      renderHook(() => useResizeObserver(ref, undefined, options));

      expect(observeMock).toHaveBeenCalledWith(element, options);
    });
  });
});

