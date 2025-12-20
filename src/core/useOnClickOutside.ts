import { useEffect, useRef } from "react";

type PossibleRef<T extends HTMLElement> = React.RefObject<T>;

export function useOnClickOutside<T extends HTMLElement>(
  ref: PossibleRef<T> | Array<PossibleRef<T>>,
  handler: (event: MouseEvent | TouchEvent | PointerEvent) => void,
  eventType: "mousedown" | "mouseup" | "click" | "touchstart" | "pointerdown" =
    "mousedown",
  options?: AddEventListenerOptions | boolean
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const refs = Array.isArray(ref) ? ref : [ref];
    const listener = (event: MouseEvent | TouchEvent | PointerEvent) => {
      const target = event.target;
      if (typeof Node === "undefined" || !(target instanceof Node)) {
        return;
      }

      const clickedInside = refs.some((currentRef) => {
        const node = currentRef.current;
        return node ? node.contains(target) : false;
      });

      if (!clickedInside) {
        handlerRef.current(event);
      }
    };

    document.addEventListener(eventType, listener, options);
    return () => {
      document.removeEventListener(eventType, listener, options);
    };
  }, [eventType, options, ref]);
}
