import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  // Use useIsomorphicLayoutEffect to capture the previous value synchronously
  // BEFORE paint. This ensures that during render, ref.current holds the actual
  // previous value (from the last render), not the current value.
  // Using useEffect would update AFTER paint, making comparisons incorrect.
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
