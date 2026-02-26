import { useCallback, useEffect, useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Granular classification of the detected primary input device.
 *
 * - `"unknown"` – returned during SSR and before the first client-side
 *   evaluation completes.  Consumers should treat this as "not yet determined"
 *   and render a safe, non-committal default (e.g. show both touch and pointer
 *   affordances, or a loading skeleton).
 * - `"touch"` – the primary input is a coarse pointer with no hover capability
 *   (phones, most tablets in touch mode).
 * - `"desktop"` – the primary input is a fine pointer with hover support
 *   (mouse, trackpad, stylus with hover).
 */
export type DeviceType = "unknown" | "touch" | "desktop";

/**
 * Configuration options for {@link useIsTouchDevice}.
 */
export interface UseIsTouchDeviceOptions {
  /**
   * Value returned during SSR and before the first client-side detection.
   *
   * Defaults to `"unknown"`.  Override with `"touch"` or `"desktop"` when you
   * have server-side hints (e.g. User-Agent parsing via middleware) and want to
   * avoid a visible layout shift after hydration.
   */
  defaultDeviceType?: DeviceType;
}

/**
 * Shape returned by {@link useIsTouchDevice}.
 *
 * The object reference is memoized with `useMemo` so it remains referentially
 * stable across re-renders when `deviceType` has not changed — safe to include
 * in downstream dependency arrays without triggering spurious effects.
 */
export interface UseIsTouchDeviceResult {
  /** Granular device classification (`"unknown"` | `"touch"` | `"desktop"`). */
  deviceType: DeviceType;

  /** Convenience boolean — `true` when `deviceType === "touch"`. */
  isTouchDevice: boolean;

  /**
   * Re-run touch detection imperatively.
   *
   * Useful after external events that the hook cannot observe automatically
   * (e.g. a WebHID device connect, or a custom "mode switch" UI toggle).
   * The callback reference is stable across the lifetime of the hook.
   */
  recheck: () => void;
}

// ---------------------------------------------------------------------------
// Detection internals
// ---------------------------------------------------------------------------

/**
 * CSS media query targeting devices whose *primary* pointing device is coarse
 * and lacks hover — the W3C Interaction Media Features (Level 4) definition of
 * a touch-first device.
 *
 * Evaluated via `matchMedia` and subscribed to with a `change` listener so
 * convertible laptops, detachable tablets, and foldables react to input-mode
 * switches in real time.
 *
 * @see https://www.w3.org/TR/mediaqueries-4/#mf-interaction
 */
const TOUCH_MEDIA_QUERY = "(hover: none) and (pointer: coarse)";

/**
 * Synchronously evaluate touch capability using a two-tier strategy.
 *
 * **Tier 1 — Interaction Media Features** (`pointer: coarse` + `hover: none`).
 * Most accurate on modern browsers (Chrome 41+, Firefox 64+, Safari 9+) and
 * correctly classifies hybrid devices by inspecting only the *primary* input.
 *
 * **Tier 2 — Legacy touch-API probe** (`ontouchstart` on window,
 * `navigator.maxTouchPoints`).  Covers older Android WebView and pre-Chromium
 * Edge.  This probe can produce false positives on some desktop touchscreens,
 * but it is only reached when Tier 1 is inconclusive.
 *
 * The function must only be called in a browser context — callers are
 * responsible for guarding with `typeof window !== "undefined"`.
 */
function detectTouchCapability(): DeviceType {
  // Tier 1: Interaction Media Features (wide support since ~2018).
  if (typeof window.matchMedia === "function") {
    const mql = window.matchMedia(TOUCH_MEDIA_QUERY);

    // `mql.media` is set to `"not all"` when the browser does not understand
    // the query at all — in that case we fall through to the legacy probe.
    if (mql.media !== "not all") {
      return mql.matches ? "touch" : "desktop";
    }
  }

  // Tier 2: legacy touch-API probe.
  if (
    "ontouchstart" in window ||
    (typeof navigator !== "undefined" &&
      typeof navigator.maxTouchPoints === "number" &&
      navigator.maxTouchPoints > 0)
  ) {
    return "touch";
  }

  return "desktop";
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Detect whether the device's primary input mechanism is touch-based.
 *
 * Uses a layered detection strategy combining CSS Interaction Media Features
 * (`pointer: coarse`, `hover: none`) with legacy touch-API probing
 * (`ontouchstart`, `maxTouchPoints`) for maximum browser coverage.
 *
 * ### SSR safety
 *
 * The hook returns `"unknown"` (or a caller-supplied `defaultDeviceType`) on
 * the server **and** during the first client render, so the server and client
 * always produce identical markup — no hydration mismatch.  After the commit
 * phase, a `useEffect` evaluates synchronously and subscribes to `matchMedia`
 * change events.
 *
 * ### Dynamic updates
 *
 * On browsers that support Interaction Media Features, the hook listens for
 * `change` events on the `(hover: none) and (pointer: coarse)` query.  This
 * means convertible laptops, detachable tablets, and foldables will
 * automatically re-classify when the user switches input modes — no polling
 * required.
 *
 * ### Performance
 *
 * - Detection runs once on mount (one `matchMedia` call) — no per-render work.
 * - The `change` listener is passive and only fires on actual input-mode
 *   transitions (rare).
 * - The returned object is memoized; `deviceType` must change for the
 *   reference to update.
 * - The `recheck` callback is `useCallback`-stable for the hook's lifetime.
 *
 * @param options - Optional configuration.  See {@link UseIsTouchDeviceOptions}.
 * @returns A memoized {@link UseIsTouchDeviceResult} object.
 *
 * @example
 * ```tsx
 * import { useIsTouchDevice } from "@opensite/hooks/useIsTouchDevice";
 *
 * function Toolbar() {
 *   const { isTouchDevice } = useIsTouchDevice();
 *   return isTouchDevice ? <TouchToolbar /> : <DesktopToolbar />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With a server-side hint to eliminate layout shift
 * function Page({ ssrDeviceType }: { ssrDeviceType: DeviceType }) {
 *   const { deviceType } = useIsTouchDevice({
 *     defaultDeviceType: ssrDeviceType,
 *   });
 *   // ...
 * }
 * ```
 */
export function useIsTouchDevice(
  options: UseIsTouchDeviceOptions = {},
): UseIsTouchDeviceResult {
  const { defaultDeviceType = "unknown" } = options;

  // SSR-safe initial state — never accesses browser APIs at initialization.
  const [deviceType, setDeviceType] = useState<DeviceType>(defaultDeviceType);

  // Stable imperative re-evaluation callback.  Guarded so it is a safe no-op
  // if accidentally called during SSR (e.g. in a shared util).
  const recheck = useCallback(() => {
    if (typeof window === "undefined") return;
    setDeviceType(detectTouchCapability());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Synchronous first evaluation — updates state in the same commit so
    // consumers see the real value on the very first paint after hydration.
    setDeviceType(detectTouchCapability());

    // Subscribe to media-query changes so hybrid/convertible devices update
    // when the user switches between touch and pointer input modes.
    if (typeof window.matchMedia !== "function") return;

    const mql = window.matchMedia(TOUCH_MEDIA_QUERY);

    // If the browser doesn't understand the query there's nothing to listen
    // for — the legacy probe result from above is our final answer.
    if (mql.media === "not all") return;

    const onChange = (event: MediaQueryListEvent) => {
      setDeviceType(event.matches ? "touch" : "desktop");
    };

    mql.addEventListener("change", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  // Memoize the return object so consumers that destructure or pass the whole
  // result into dependency arrays don't trigger spurious re-renders.
  return useMemo<UseIsTouchDeviceResult>(
    () => ({
      deviceType,
      isTouchDevice: deviceType === "touch",
      recheck,
    }),
    [deviceType, recheck],
  );
}
