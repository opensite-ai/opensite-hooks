import { useCallback, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "./useMediaQuery.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Tailwind CSS breakpoint identifiers.
 *
 * - `"default"` – viewport width below the smallest defined breakpoint (< 640px)
 * - `"sm"` – small devices (>= 640px)
 * - `"md"` – medium devices (>= 768px)
 * - `"lg"` – large devices (>= 1024px)
 * - `"xl"` – extra large devices (>= 1280px)
 * - `"2xl"` – 2x extra large devices (>= 1536px)
 */
export type TailwindSize = "default" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Semantic screen type classification for layout decisions.
 *
 * - `"MOBILE"` – phone-sized viewports (default + sm breakpoints)
 * - `"TABLET"` – tablet-sized viewports (md breakpoint)
 * - `"DESKTOP"` – desktop-sized viewports (lg, xl, 2xl breakpoints)
 * - `"UNKNOWN"` – returned during SSR before client-side detection
 */
export type ScreenType = "UNKNOWN" | "MOBILE" | "TABLET" | "DESKTOP";

/**
 * Breakpoint configuration with pixel thresholds.
 *
 * Values represent the minimum width (in pixels) for each breakpoint.
 * Follows Tailwind CSS v4 defaults.
 */
export interface ScreenBreakpoints {
  /** Minimum width for `sm` breakpoint. Default: 640 */
  sm: number;
  /** Minimum width for `md` breakpoint. Default: 768 */
  md: number;
  /** Minimum width for `lg` breakpoint. Default: 1024 */
  lg: number;
  /** Minimum width for `xl` breakpoint. Default: 1280 */
  xl: number;
  /** Minimum width for `2xl` breakpoint. Default: 1536 */
  "2xl": number;
}

/**
 * Mapping of Tailwind breakpoints to semantic screen types.
 */
export interface ScreenTypeMapping {
  /** Screen type for default (< sm) viewport. Default: "MOBILE" */
  default: ScreenType;
  /** Screen type for sm viewport. Default: "MOBILE" */
  sm: ScreenType;
  /** Screen type for md viewport. Default: "TABLET" */
  md: ScreenType;
  /** Screen type for lg viewport. Default: "DESKTOP" */
  lg: ScreenType;
  /** Screen type for xl viewport. Default: "DESKTOP" */
  xl: ScreenType;
  /** Screen type for 2xl viewport. Default: "DESKTOP" */
  "2xl": ScreenType;
}

/**
 * Configuration options for {@link useScreen}.
 */
export interface UseScreenOptions {
  /**
   * Custom breakpoint pixel thresholds.
   * Partial object that merges with Tailwind v4 defaults.
   */
  breakpoints?: Partial<ScreenBreakpoints>;

  /**
   * Custom mapping of breakpoints to screen types.
   * Partial object that merges with defaults.
   */
  screenTypeMapping?: Partial<ScreenTypeMapping>;

  /**
   * Default screen type returned during SSR and before detection.
   * Defaults to `"UNKNOWN"`.
   */
  defaultScreenType?: ScreenType;

  /**
   * Default Tailwind size returned during SSR and before detection.
   * Defaults to `"default"`.
   */
  defaultTailwindSize?: TailwindSize;
}

/**
 * Shape returned by {@link useScreen}.
 *
 * The object reference is memoized with `useMemo` so it remains referentially
 * stable across re-renders when values have not changed.
 */
export interface UseScreenResult {
  /** Current viewport width in pixels. `0` during SSR. */
  width: number;

  /** Current viewport height in pixels. `0` during SSR. */
  height: number;

  /**
   * Current Tailwind CSS breakpoint identifier.
   * Determined by the largest matching `min-width` breakpoint.
   */
  tailwindSize: TailwindSize;

  /**
   * Semantic screen type for layout decisions.
   * Maps `tailwindSize` to a simplified classification.
   */
  screenType: ScreenType;

  /** Re-measure viewport dimensions on demand. */
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Tailwind CSS v4 default breakpoints (min-width values in pixels).
 * @see https://tailwindcss.com/docs/responsive-design
 */
const DEFAULT_BREAKPOINTS: ScreenBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * Default mapping of Tailwind breakpoints to semantic screen types.
 *
 * - default, sm → MOBILE
 * - md → TABLET
 * - lg, xl, 2xl → DESKTOP
 */
const DEFAULT_SCREEN_TYPE_MAPPING: ScreenTypeMapping = {
  default: "MOBILE",
  sm: "MOBILE",
  md: "TABLET",
  lg: "DESKTOP",
  xl: "DESKTOP",
  "2xl": "DESKTOP",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get current viewport dimensions.
 * Returns `{ width: 0, height: 0 }` during SSR.
 */
function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Determine the current Tailwind breakpoint based on viewport width.
 * Uses mobile-first logic: returns the largest breakpoint that matches.
 */
function calculateTailwindSize(
  width: number,
  breakpoints: ScreenBreakpoints,
): TailwindSize {
  // Check breakpoints from largest to smallest (mobile-first)
  if (width >= breakpoints["2xl"]) return "2xl";
  if (width >= breakpoints.xl) return "xl";
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  if (width >= breakpoints.sm) return "sm";
  return "default";
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Track viewport dimensions and compute Tailwind breakpoint / screen type.
 *
 * Provides real-time viewport width and height, along with derived values for
 * the current Tailwind CSS breakpoint (`tailwindSize`) and a semantic screen
 * type classification (`screenType`) for layout decisions.
 *
 * ### SSR Safety
 *
 * The hook returns safe defaults during SSR (`width: 0`, `height: 0`,
 * `tailwindSize: "default"`, `screenType: "UNKNOWN"`) to prevent hydration
 * mismatches. After mount, values update to reflect the actual viewport.
 *
 * ### Performance
 *
 * - Uses `useMediaQuery` internally for efficient breakpoint detection via
 *   CSS media queries (no polling).
 * - Viewport dimensions update on window `resize` events.
 * - The returned object is memoized; values must change for the reference
 *   to update.
 *
 * @param options - Optional configuration. See {@link UseScreenOptions}.
 * @returns A memoized {@link UseScreenResult} object.
 *
 * @example
 * ```tsx
 * import { useScreen } from "@opensite/hooks/useScreen";
 *
 * function ResponsiveLayout() {
 *   const { screenType, tailwindSize, width } = useScreen();
 *
 *   return (
 *     <div>
 *       <p>Viewport: {width}px ({tailwindSize})</p>
 *       {screenType === "MOBILE" && <MobileNav />}
 *       {screenType === "TABLET" && <TabletNav />}
 *       {screenType === "DESKTOP" && <DesktopNav />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom breakpoints
 * const { screenType } = useScreen({
 *   breakpoints: { sm: 600, md: 900, lg: 1200, xl: 1400, "2xl": 1800 },
 * });
 * ```
 */
export function useScreen(options: UseScreenOptions = {}): UseScreenResult {
  const {
    breakpoints: customBreakpoints,
    screenTypeMapping: customMapping,
    defaultScreenType = "UNKNOWN",
    defaultTailwindSize = "default",
  } = options;

  // Merge custom config with defaults
  const breakpoints = useMemo<ScreenBreakpoints>(
    () => ({ ...DEFAULT_BREAKPOINTS, ...customBreakpoints }),
    [customBreakpoints],
  );

  const screenTypeMapping = useMemo<ScreenTypeMapping>(
    () => ({ ...DEFAULT_SCREEN_TYPE_MAPPING, ...customMapping }),
    [customMapping],
  );

  // Track viewport dimensions
  const [dimensions, setDimensions] = useState(() => getViewportDimensions());

  // Use media queries for breakpoint detection (more reliable than width alone
  // for edge cases and provides instant updates via matchMedia)
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm}px)`);
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);
  const is2xl = useMediaQuery(`(min-width: ${breakpoints["2xl"]}px)`);

  // Stable refresh callback
  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;
    setDimensions(getViewportDimensions());
  }, []);

  // Subscribe to resize events for dimension tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial measurement
    setDimensions(getViewportDimensions());

    const handleResize = () => {
      setDimensions(getViewportDimensions());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute tailwindSize from media query results (most reliable)
  const tailwindSize = useMemo<TailwindSize>(() => {
    // During SSR, all media queries return false
    if (!isSm && !isMd && !isLg && !isXl && !is2xl) {
      // Check if we're on client with actual dimensions
      if (dimensions.width > 0) {
        return calculateTailwindSize(dimensions.width, breakpoints);
      }
      return defaultTailwindSize;
    }

    // Determine from media queries (largest matching breakpoint wins)
    if (is2xl) return "2xl";
    if (isXl) return "xl";
    if (isLg) return "lg";
    if (isMd) return "md";
    if (isSm) return "sm";
    return "default";
  }, [
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    dimensions.width,
    breakpoints,
    defaultTailwindSize,
  ]);

  // Derive screen type from tailwind size
  const screenType = useMemo<ScreenType>(() => {
    // During SSR before detection
    if (tailwindSize === defaultTailwindSize && dimensions.width === 0) {
      return defaultScreenType;
    }
    return screenTypeMapping[tailwindSize];
  }, [
    tailwindSize,
    screenTypeMapping,
    dimensions.width,
    defaultScreenType,
    defaultTailwindSize,
  ]);

  // Memoize the return object for stable references
  return useMemo<UseScreenResult>(
    () => ({
      width: dimensions.width,
      height: dimensions.height,
      tailwindSize,
      screenType,
      refresh,
    }),
    [dimensions.width, dimensions.height, tailwindSize, screenType, refresh],
  );
}
