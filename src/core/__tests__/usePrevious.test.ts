import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePrevious } from "../usePrevious.js";

describe("usePrevious", () => {
  it("should return undefined on initial render", () => {
    const { result } = renderHook(() => usePrevious("initial"));
    expect(result.current).toBeUndefined();
  });

  it("should return previous value after update", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: "first" },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: "second" });
    expect(result.current).toBe("first");

    rerender({ value: "third" });
    expect(result.current).toBe("second");
  });

  it("should work with numbers", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it("should work with objects", () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: obj2 });
    expect(result.current).toBe(obj1);
  });

  it("should work with null and undefined", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: null as string | null } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: "value" });
    expect(result.current).toBeNull();

    rerender({ value: null });
    expect(result.current).toBe("value");
  });

  it("should update synchronously for comparison logic", () => {
    // This test validates that usePrevious uses useIsomorphicLayoutEffect
    // to ensure the previous value is captured BEFORE paint, making
    // comparisons like `if (value !== previousValue)` work correctly
    let comparisonResult: boolean | null = null;

    const { rerender } = renderHook(
      ({ value }) => {
        const previous = usePrevious(value);
        // This comparison happens during render - previous must be
        // the actual previous value, not the current value
        comparisonResult = value !== previous;
        return previous;
      },
      { initialProps: { value: 1 } }
    );

    // First render: previous is undefined, value is 1
    expect(comparisonResult).toBe(true);

    rerender({ value: 2 });
    // Second render: previous should be 1, value is 2
    expect(comparisonResult).toBe(true);

    rerender({ value: 2 });
    // Third render: previous should be 2, value is 2 (no change)
    expect(comparisonResult).toBe(false);
  });
});

