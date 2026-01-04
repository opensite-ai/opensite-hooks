import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useIsClient } from "../useIsClient.js";

describe("useIsClient", () => {
  it("should return true after mount (client-side)", () => {
    const { result } = renderHook(() => useIsClient());
    // After mount, useEffect should have run setting isClient to true
    expect(result.current).toBe(true);
  });

  it("should return consistent value across re-renders", () => {
    const { result, rerender } = renderHook(() => useIsClient());

    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(true);
  });
});

