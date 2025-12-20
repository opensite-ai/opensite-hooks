import { useEffect, useState } from "react";
import { DebounceOptions, useDebounceCallback } from "./useDebounceCallback";

export function useDebounceValue<T>(
  value: T,
  delay: number,
  options?: DebounceOptions
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const { debouncedCallback, cancel } = useDebounceCallback(
    (next: T) => {
      setDebouncedValue(next);
    },
    delay,
    options
  );

  useEffect(() => {
    debouncedCallback(value);
  }, [debouncedCallback, value]);

  useEffect(() => () => cancel(), [cancel]);

  return debouncedValue;
}
