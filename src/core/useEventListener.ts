import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";

type EventTargetLike = Window | Document | HTMLElement | null;
type ElementRef = React.RefObject<HTMLElement>;

const isRefObject = (value: unknown): value is ElementRef =>
  !!value && typeof value === "object" && "current" in value;

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window,
  options?: AddEventListenerOptions | boolean
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: Document,
  options?: AddEventListenerOptions | boolean
): void;
export function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: ElementRef,
  options?: AddEventListenerOptions | boolean
): void;
export function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: HTMLElement,
  options?: AddEventListenerOptions | boolean
): void;
export function useEventListener(
  eventName: string,
  handler: EventListenerOrEventListenerObject,
  element?: EventTargetLike | ElementRef,
  options?: AddEventListenerOptions | boolean
): void {
  const savedHandler = useRef(handler);

  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isWindow =
      typeof Window !== "undefined" && element instanceof Window;
    const isDocument =
      typeof Document !== "undefined" && element instanceof Document;

    const target: EventTargetLike | null =
      element === undefined
        ? typeof window !== "undefined"
          ? window
          : null
        : isWindow || isDocument
        ? element
        : typeof HTMLElement !== "undefined" && element instanceof HTMLElement
        ? element
        : isRefObject(element)
        ? element.current
        : null;

    if (!target?.addEventListener) {
      return;
    }

    const listener = (event: Event) => {
      const currentHandler = savedHandler.current;
      if (typeof currentHandler === "function") {
        currentHandler(event);
      } else {
        currentHandler.handleEvent(event);
      }
    };

    target.addEventListener(eventName, listener, options);

    return () => {
      target.removeEventListener(eventName, listener, options);
    };
  }, [eventName, element, options]);
}
