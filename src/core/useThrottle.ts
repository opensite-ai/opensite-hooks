import { useEffect, useRef, useState } from "react";

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function useThrottle<T>(
  value: T,
  interval: number,
  options: ThrottleOptions = {}
): T {
  const leading = options.leading ?? true;
  const trailing = options.trailing ?? true;
  const wait = Math.max(0, interval);

  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecutedRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValueRef = useRef<T | null>(null);

  useEffect(() => {
    if (wait === 0) {
      setThrottledValue(value);
      return;
    }

    const now = Date.now();

    if (lastExecutedRef.current === 0) {
      lastExecutedRef.current = now;
      if (leading) {
        setThrottledValue(value);
        return;
      }
      if (trailing && !timeoutRef.current) {
        pendingValueRef.current = value;
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          if (pendingValueRef.current !== null) {
            setThrottledValue(pendingValueRef.current);
            pendingValueRef.current = null;
            lastExecutedRef.current = Date.now();
          }
        }, wait);
      }
      return;
    }

    const elapsed = now - lastExecutedRef.current;

    if (elapsed >= wait && leading) {
      setThrottledValue(value);
      lastExecutedRef.current = now;
      pendingValueRef.current = null;
      return;
    }

    if (trailing) {
      pendingValueRef.current = value;
      if (!timeoutRef.current) {
        const remaining = Math.max(wait - elapsed, 0);
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          if (pendingValueRef.current !== null) {
            setThrottledValue(pendingValueRef.current);
            pendingValueRef.current = null;
            lastExecutedRef.current = Date.now();
          }
        }, remaining);
      }
    }
  }, [leading, trailing, value, wait]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledValue;
}
