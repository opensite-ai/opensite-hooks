import { useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";

type TargetElement<T extends Element> = React.RefObject<T> | T | null;

const isRefObject = <T extends Element>(
  value: unknown
): value is React.RefObject<T> => !!value && typeof value === "object" && "current" in value;

export function useResizeObserver<T extends Element>(
  target: TargetElement<T>,
  onResize?: (entry: ResizeObserverEntry) => void,
  options?: ResizeObserverOptions
): ResizeObserverEntry | null {
  const callbackRef = useRef(onResize);
  const entryRef = useRef<ResizeObserverEntry | null>(null);
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null);

  useIsomorphicLayoutEffect(() => {
    callbackRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const element =
      typeof Element !== "undefined" && target instanceof Element
        ? target
        : isRefObject<T>(target)
        ? target.current
        : null;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const firstEntry = entries[0];
      entryRef.current = firstEntry;
      if (callbackRef.current) {
        callbackRef.current(firstEntry);
      } else {
        setEntry(firstEntry);
      }
    });

    observer.observe(element, options);
    return () => observer.disconnect();
  }, [options, target]);

  return callbackRef.current ? entryRef.current : entry;
}
