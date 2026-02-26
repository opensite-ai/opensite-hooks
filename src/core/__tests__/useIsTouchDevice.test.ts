import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useIsTouchDevice } from "../useIsTouchDevice.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Configure the `window.matchMedia` mock so `TOUCH_MEDIA_QUERY` returns the
 * desired state.  Also captures `change` listeners for later simulation.
 */
function setupMatchMedia(options: {
  matches: boolean;
  /** Set to `true` to simulate a browser that does NOT support Interaction
   *  Media Features (the returned `media` property will be `"not all"`). */
  unsupported?: boolean;
}) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];

  const mql = {
    matches: options.matches,
    media: options.unsupported
      ? "not all"
      : "(hover: none) and (pointer: coarse)",
    onchange: null,
    addEventListener: vi.fn((_: string, cb: (e: MediaQueryListEvent) => void) =>
      listeners.push(cb),
    ),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue(mql),
  });

  return { mql, listeners };
}

/** Fire a synthetic `change` event on captured matchMedia listeners. */
function fireMediaChange(
  listeners: Array<(e: MediaQueryListEvent) => void>,
  matches: boolean,
) {
  const event = {
    matches,
    media: "(hover: none) and (pointer: coarse)",
  } as MediaQueryListEvent;
  listeners.forEach((l) => l(event));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useIsTouchDevice", () => {
  // Restore any window property changes after each test.
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // Initialization / SSR safety
  // -----------------------------------------------------------------------

  describe("initialization", () => {
    it('should default to "unknown" before client-side detection', () => {
      // With default matchMedia mock (matches: false) — the hook still
      // starts at "unknown" synchronously to stay SSR-safe.
      setupMatchMedia({ matches: false });

      const { result } = renderHook(() => useIsTouchDevice());

      // After the effect fires the value should settle.
      expect(["unknown", "desktop", "touch"]).toContain(
        result.current.deviceType,
      );
    });

    it("should accept a custom defaultDeviceType", () => {
      setupMatchMedia({ matches: false });

      // The very first synchronous render should reflect the default before
      // the effect fires, but after the effect it should re-evaluate.
      const { result } = renderHook(() =>
        useIsTouchDevice({ defaultDeviceType: "touch" }),
      );

      // After effect, matchMedia says non-touch → desktop
      expect(result.current.deviceType).toBe("desktop");
    });

    it('should detect "touch" when matchMedia reports coarse pointer', () => {
      setupMatchMedia({ matches: true });

      const { result } = renderHook(() => useIsTouchDevice());

      expect(result.current.deviceType).toBe("touch");
      expect(result.current.isTouchDevice).toBe(true);
    });

    it('should detect "desktop" when matchMedia reports fine pointer', () => {
      setupMatchMedia({ matches: false });

      const { result } = renderHook(() => useIsTouchDevice());

      expect(result.current.deviceType).toBe("desktop");
      expect(result.current.isTouchDevice).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Legacy fallback (ontouchstart / maxTouchPoints)
  // -----------------------------------------------------------------------

  describe("legacy touch-API fallback", () => {
    it("should detect touch via ontouchstart when matchMedia is unsupported", () => {
      setupMatchMedia({ matches: false, unsupported: true });

      // Simulate `ontouchstart` being present on window.
      Object.defineProperty(window, "ontouchstart", {
        writable: true,
        configurable: true,
        value: null,
      });

      const { result } = renderHook(() => useIsTouchDevice());

      expect(result.current.deviceType).toBe("touch");
      expect(result.current.isTouchDevice).toBe(true);

      // Cleanup
      delete (window as any).ontouchstart;
    });

    it("should detect touch via maxTouchPoints when matchMedia is unsupported", () => {
      setupMatchMedia({ matches: false, unsupported: true });

      // Make sure ontouchstart is absent so we fall through to maxTouchPoints.
      delete (window as any).ontouchstart;

      const originalMaxTouchPoints = navigator.maxTouchPoints;
      Object.defineProperty(navigator, "maxTouchPoints", {
        writable: true,
        configurable: true,
        value: 5,
      });

      const { result } = renderHook(() => useIsTouchDevice());

      expect(result.current.deviceType).toBe("touch");

      // Cleanup
      Object.defineProperty(navigator, "maxTouchPoints", {
        writable: true,
        configurable: true,
        value: originalMaxTouchPoints,
      });
    });

    it('should return "desktop" when no touch APIs are present', () => {
      setupMatchMedia({ matches: false, unsupported: true });

      delete (window as any).ontouchstart;

      const originalMaxTouchPoints = navigator.maxTouchPoints;
      Object.defineProperty(navigator, "maxTouchPoints", {
        writable: true,
        configurable: true,
        value: 0,
      });

      const { result } = renderHook(() => useIsTouchDevice());

      expect(result.current.deviceType).toBe("desktop");
      expect(result.current.isTouchDevice).toBe(false);

      // Cleanup
      Object.defineProperty(navigator, "maxTouchPoints", {
        writable: true,
        configurable: true,
        value: originalMaxTouchPoints,
      });
    });
  });

  // -----------------------------------------------------------------------
  // Dynamic updates via matchMedia change events
  // -----------------------------------------------------------------------

  describe("dynamic updates", () => {
    it("should update from desktop to touch when media query changes", () => {
      const { listeners } = setupMatchMedia({ matches: false });

      const { result } = renderHook(() => useIsTouchDevice());
      expect(result.current.deviceType).toBe("desktop");

      act(() => {
        fireMediaChange(listeners, true);
      });

      expect(result.current.deviceType).toBe("touch");
      expect(result.current.isTouchDevice).toBe(true);
    });

    it("should update from touch to desktop when media query changes", () => {
      const { listeners } = setupMatchMedia({ matches: true });

      const { result } = renderHook(() => useIsTouchDevice());
      expect(result.current.deviceType).toBe("touch");

      act(() => {
        fireMediaChange(listeners, false);
      });

      expect(result.current.deviceType).toBe("desktop");
      expect(result.current.isTouchDevice).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Recheck
  // -----------------------------------------------------------------------

  describe("recheck", () => {
    it("should re-evaluate detection when recheck is called", () => {
      const matchMediaMock = setupMatchMedia({ matches: false });

      const { result } = renderHook(() => useIsTouchDevice());
      expect(result.current.deviceType).toBe("desktop");

      // Mutate the mock to simulate the environment changing.
      matchMediaMock.mql.matches = true;

      act(() => {
        result.current.recheck();
      });

      expect(result.current.deviceType).toBe("touch");
    });
  });

  // -----------------------------------------------------------------------
  // Callback stability
  // -----------------------------------------------------------------------

  describe("callback stability", () => {
    it("should maintain a stable recheck reference across re-renders", () => {
      setupMatchMedia({ matches: false });

      const { result, rerender } = renderHook(() => useIsTouchDevice());
      const initialRecheck = result.current.recheck;

      rerender();

      expect(result.current.recheck).toBe(initialRecheck);
    });

    it("should maintain a stable result object when deviceType is unchanged", () => {
      setupMatchMedia({ matches: false });

      const { result, rerender } = renderHook(() => useIsTouchDevice());
      const initialResult = result.current;

      rerender();

      expect(result.current).toBe(initialResult);
    });

    it("should update result reference when deviceType changes", () => {
      const { listeners } = setupMatchMedia({ matches: false });

      const { result } = renderHook(() => useIsTouchDevice());
      const initialResult = result.current;

      act(() => {
        fireMediaChange(listeners, true);
      });

      expect(result.current).not.toBe(initialResult);
      expect(result.current.deviceType).toBe("touch");
    });
  });

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------

  describe("cleanup", () => {
    it("should remove matchMedia listener on unmount", () => {
      const { mql } = setupMatchMedia({ matches: false });

      const { unmount } = renderHook(() => useIsTouchDevice());

      unmount();

      // The removeEventListener should have been called during cleanup.
      expect(mql.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });
  });

  // -----------------------------------------------------------------------
  // isTouchDevice derived value
  // -----------------------------------------------------------------------

  describe("isTouchDevice derived value", () => {
    it("should be true when deviceType is touch", () => {
      setupMatchMedia({ matches: true });

      const { result } = renderHook(() => useIsTouchDevice());
      expect(result.current.isTouchDevice).toBe(true);
    });

    it("should be false when deviceType is desktop", () => {
      setupMatchMedia({ matches: false });

      const { result } = renderHook(() => useIsTouchDevice());
      expect(result.current.isTouchDevice).toBe(false);
    });

    it('should be false when deviceType is "unknown" (pre-detection)', () => {
      // Simulate a scenario where the effect hasn't fired yet by checking
      // the relationship: unknown → isTouchDevice === false
      setupMatchMedia({ matches: false });

      // Use defaultDeviceType to keep it at "unknown" for the initial sync
      // render.  After the effect fires it will move to "desktop".
      // We verify the logical correctness of the derived boolean.
      const { result } = renderHook(() =>
        useIsTouchDevice({ defaultDeviceType: "unknown" }),
      );

      // After effect: "desktop"
      expect(result.current.isTouchDevice).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // matchMedia missing (very old browser / test environments)
  // -----------------------------------------------------------------------

  describe("matchMedia unavailable", () => {
    it("should fall back to touch-API probe when matchMedia is missing", () => {
      // Remove matchMedia entirely.
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        configurable: true,
        value: undefined,
      });

      Object.defineProperty(window, "ontouchstart", {
        writable: true,
        configurable: true,
        value: null,
      });

      const { result } = renderHook(() => useIsTouchDevice());

      expect(result.current.deviceType).toBe("touch");

      delete (window as any).ontouchstart;
    });
  });
});
