import { useCallback, useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface DebouncedCallback<T extends (...args: any[]) => void> {
  debouncedCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
}

export function useDebounceCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  options: DebounceOptions = {}
): DebouncedCallback<T> {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  const leading = options.leading ?? false;
  const trailing = options.trailing ?? true;
  const maxWait = options.maxWait;
  const wait = Math.max(0, delay);

  useIsomorphicLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  const invoke = useCallback(() => {
    if (!lastArgsRef.current) {
      return;
    }
    const args = lastArgsRef.current;
    lastArgsRef.current = null;
    callbackRef.current(...args);
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args;

      const shouldInvokeLeading =
        leading && timeoutRef.current === null && maxTimeoutRef.current === null;
      if (shouldInvokeLeading) {
        invoke();
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          if (lastArgsRef.current) {
            invoke();
          }
          if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
            maxTimeoutRef.current = null;
          }
        }, wait);
      }

      if (maxWait !== undefined && maxWait !== null && trailing) {
        if (!maxTimeoutRef.current) {
          const maxDelay = Math.max(0, maxWait);
          maxTimeoutRef.current = setTimeout(() => {
            maxTimeoutRef.current = null;
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            if (lastArgsRef.current) {
              invoke();
            }
          }, maxDelay);
        }
      }
    },
    [invoke, leading, trailing, maxWait, wait]
  );

  const cancel = useCallback(() => {
    clearTimers();
    lastArgsRef.current = null;
  }, [clearTimers]);

  const flush = useCallback(() => {
    if (!lastArgsRef.current) {
      return;
    }
    clearTimers();
    invoke();
  }, [clearTimers, invoke]);

  useEffect(() => () => cancel(), [cancel]);

  return { debouncedCallback, cancel, flush };
}
