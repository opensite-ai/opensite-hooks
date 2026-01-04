import { describe, it, expect } from "vitest";
import { useLayoutEffect } from "react";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect.js";

describe("useIsomorphicLayoutEffect", () => {
  it("should be useLayoutEffect in browser environment", () => {
    // In happy-dom (browser-like), it should be useLayoutEffect
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
  });

  it("should be a function", () => {
    expect(typeof useIsomorphicLayoutEffect).toBe("function");
  });
});

