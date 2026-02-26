import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useScreen } from "../useScreen.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Configure the matchMedia mock to return specific breakpoint states.
 */
function setupMatchMedia(breakpointStates: {
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  "2xl"?: boolean;
}) {
  const listeners = new Map<string, ((e: MediaQueryListEvent) => void)[]>();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => {
      if (!listeners.has(query)) {
        listeners.set(query, []);
      }

      // Determine which breakpoint this query is checking
      let matches = false;
      if (query.includes("640px")) matches = breakpointStates.sm ?? false;
      else if (query.includes("768px")) matches = breakpointStates.md ?? false;
      else if (query.includes("1024px")) matches = breakpointStates.lg ?? false;
      else if (query.includes("1280px")) matches = breakpointStates.xl ?? false;
      else if (query.includes("1536px"))
        matches = breakpointStates["2xl"] ?? false;

      return {
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn((_, cb) => listeners.get(query)!.push(cb)),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });

  return { listeners };
}

/**
 * Configure window dimensions mock.
 */
function setupWindowDimensions(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });
}

/**
 * Fire a resize event to trigger dimension updates.
 */
function fireResize(width: number, height: number) {
  setupWindowDimensions(width, height);
  window.dispatchEvent(new Event("resize"));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useScreen", () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  describe("initialization", () => {
    it("should return viewport dimensions", () => {
      setupWindowDimensions(1024, 768);
      setupMatchMedia({ sm: true, md: true, lg: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);
    });

    it('should detect "default" tailwindSize when below sm breakpoint', () => {
      setupWindowDimensions(400, 800);
      setupMatchMedia({});

      const { result } = renderHook(() => useScreen());

      expect(result.current.tailwindSize).toBe("default");
      expect(result.current.screenType).toBe("MOBILE");
    });

    it('should detect "sm" tailwindSize', () => {
      setupWindowDimensions(640, 800);
      setupMatchMedia({ sm: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.tailwindSize).toBe("sm");
      expect(result.current.screenType).toBe("MOBILE");
    });

    it('should detect "md" tailwindSize', () => {
      setupWindowDimensions(768, 800);
      setupMatchMedia({ sm: true, md: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.tailwindSize).toBe("md");
      expect(result.current.screenType).toBe("TABLET");
    });

    it('should detect "lg" tailwindSize', () => {
      setupWindowDimensions(1024, 800);
      setupMatchMedia({ sm: true, md: true, lg: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.tailwindSize).toBe("lg");
      expect(result.current.screenType).toBe("DESKTOP");
    });

    it('should detect "xl" tailwindSize', () => {
      setupWindowDimensions(1280, 800);
      setupMatchMedia({ sm: true, md: true, lg: true, xl: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.tailwindSize).toBe("xl");
      expect(result.current.screenType).toBe("DESKTOP");
    });

    it('should detect "2xl" tailwindSize', () => {
      setupWindowDimensions(1536, 800);
      setupMatchMedia({ sm: true, md: true, lg: true, xl: true, "2xl": true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.tailwindSize).toBe("2xl");
      expect(result.current.screenType).toBe("DESKTOP");
    });
  });

  // -------------------------------------------------------------------------
  // Screen type mapping
  // -------------------------------------------------------------------------

  describe("screen type mapping", () => {
    it('should map default to "MOBILE"', () => {
      setupWindowDimensions(400, 800);
      setupMatchMedia({});

      const { result } = renderHook(() => useScreen());

      expect(result.current.screenType).toBe("MOBILE");
    });

    it('should map sm to "MOBILE"', () => {
      setupWindowDimensions(640, 800);
      setupMatchMedia({ sm: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.screenType).toBe("MOBILE");
    });

    it('should map md to "TABLET"', () => {
      setupWindowDimensions(768, 800);
      setupMatchMedia({ sm: true, md: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.screenType).toBe("TABLET");
    });

    it('should map lg to "DESKTOP"', () => {
      setupWindowDimensions(1024, 800);
      setupMatchMedia({ sm: true, md: true, lg: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.screenType).toBe("DESKTOP");
    });

    it('should map xl to "DESKTOP"', () => {
      setupWindowDimensions(1280, 800);
      setupMatchMedia({ sm: true, md: true, lg: true, xl: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.screenType).toBe("DESKTOP");
    });

    it('should map 2xl to "DESKTOP"', () => {
      setupWindowDimensions(1600, 800);
      setupMatchMedia({ sm: true, md: true, lg: true, xl: true, "2xl": true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.screenType).toBe("DESKTOP");
    });
  });

  // -------------------------------------------------------------------------
  // Custom breakpoints
  // -------------------------------------------------------------------------

  describe("custom breakpoints", () => {
    it("should use custom breakpoint values", () => {
      setupWindowDimensions(700, 800);

      // Custom breakpoints: sm at 600 instead of 640
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query.includes("600px"),
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { result } = renderHook(() =>
        useScreen({
          breakpoints: { sm: 600, md: 800, lg: 1000, xl: 1200, "2xl": 1400 },
        }),
      );

      // At 700px with sm=600, should be "sm"
      expect(result.current.tailwindSize).toBe("sm");
    });
  });

  // -------------------------------------------------------------------------
  // Custom screen type mapping
  // -------------------------------------------------------------------------

  describe("custom screen type mapping", () => {
    it("should use custom screen type mapping", () => {
      setupWindowDimensions(768, 800);
      setupMatchMedia({ sm: true, md: true });

      const { result } = renderHook(() =>
        useScreen({
          screenTypeMapping: {
            default: "MOBILE",
            sm: "MOBILE",
            md: "MOBILE", // Custom: treat md as MOBILE instead of TABLET
            lg: "DESKTOP",
            xl: "DESKTOP",
            "2xl": "DESKTOP",
          },
        }),
      );

      expect(result.current.tailwindSize).toBe("md");
      expect(result.current.screenType).toBe("MOBILE");
    });
  });

  // -------------------------------------------------------------------------
  // Resize events
  // -------------------------------------------------------------------------

  describe("resize events", () => {
    it("should update dimensions on resize", () => {
      setupWindowDimensions(1024, 768);
      setupMatchMedia({ sm: true, md: true, lg: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);

      act(() => {
        fireResize(1280, 900);
      });

      expect(result.current.width).toBe(1280);
      expect(result.current.height).toBe(900);
    });
  });

  // -------------------------------------------------------------------------
  // Refresh callback
  // -------------------------------------------------------------------------

  describe("refresh callback", () => {
    it("should re-measure dimensions when refresh is called", () => {
      setupWindowDimensions(1024, 768);
      setupMatchMedia({ sm: true, md: true, lg: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.width).toBe(1024);

      // Manually change dimensions without firing resize event
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1400,
      });

      act(() => {
        result.current.refresh();
      });

      expect(result.current.width).toBe(1400);
    });

    it("should maintain stable refresh callback reference", () => {
      setupWindowDimensions(1024, 768);
      setupMatchMedia({ sm: true, md: true, lg: true });

      const { result, rerender } = renderHook(() => useScreen());

      const initialRefresh = result.current.refresh;

      rerender();

      expect(result.current.refresh).toBe(initialRefresh);
    });
  });

  // -------------------------------------------------------------------------
  // Default options
  // -------------------------------------------------------------------------

  describe("default options", () => {
    it("should use defaultScreenType option", () => {
      // Simulate SSR-like conditions where dimensions are 0
      setupWindowDimensions(0, 0);
      setupMatchMedia({});

      const { result } = renderHook(() =>
        useScreen({ defaultScreenType: "DESKTOP" }),
      );

      // When width is 0 and all media queries are false, should use default
      expect(result.current.screenType).toBe("DESKTOP");
    });

    it("should use defaultTailwindSize option", () => {
      setupWindowDimensions(0, 0);
      setupMatchMedia({});

      const { result } = renderHook(() =>
        useScreen({ defaultTailwindSize: "lg" }),
      );

      expect(result.current.tailwindSize).toBe("lg");
    });
  });

  // -------------------------------------------------------------------------
  // Callback stability
  // -------------------------------------------------------------------------

  describe("callback stability", () => {
    it("should maintain stable result object when values unchanged", () => {
      setupWindowDimensions(1024, 768);
      setupMatchMedia({ sm: true, md: true, lg: true });

      const { result, rerender } = renderHook(() => useScreen());

      const initialResult = result.current;

      rerender();

      expect(result.current).toBe(initialResult);
    });

    it("should update result object when dimensions change", () => {
      setupWindowDimensions(1024, 768);
      setupMatchMedia({ sm: true, md: true, lg: true });

      const { result } = renderHook(() => useScreen());

      const initialResult = result.current;

      act(() => {
        fireResize(1280, 900);
      });

      expect(result.current).not.toBe(initialResult);
      expect(result.current.width).toBe(1280);
    });
  });

  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------

  describe("cleanup", () => {
    it("should remove resize listener on unmount", () => {
      setupWindowDimensions(1024, 768);
      setupMatchMedia({ sm: true, md: true, lg: true });

      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useScreen());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "resize",
        expect.any(Function),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Boundary conditions
  // -------------------------------------------------------------------------

  describe("boundary conditions", () => {
    it("should handle exact breakpoint boundaries - at sm (640px)", () => {
      setupWindowDimensions(640, 800);
      setupMatchMedia({ sm: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.tailwindSize).toBe("sm");
    });

    it("should handle exact breakpoint boundaries - at md (768px)", () => {
      setupWindowDimensions(768, 800);
      setupMatchMedia({ sm: true, md: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.tailwindSize).toBe("md");
    });

    it("should handle exact breakpoint boundaries - at lg (1024px)", () => {
      setupWindowDimensions(1024, 800);
      setupMatchMedia({ sm: true, md: true, lg: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.tailwindSize).toBe("lg");
    });

    it("should handle just below breakpoint - 639px (below sm)", () => {
      setupWindowDimensions(639, 800);
      setupMatchMedia({});

      const { result } = renderHook(() => useScreen());

      expect(result.current.tailwindSize).toBe("default");
    });

    it("should handle just below breakpoint - 767px (below md)", () => {
      setupWindowDimensions(767, 800);
      setupMatchMedia({ sm: true });

      const { result } = renderHook(() => useScreen());

      expect(result.current.tailwindSize).toBe("sm");
    });
  });
});
