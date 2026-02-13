import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";

type PossibleRef<T extends HTMLElement> = React.RefObject<T>;

// Debug mode - set to true to enable console logging
const DEBUG_CLICK_OUTSIDE = false;

/**
 * Get the owner document for a given element.
 * This is crucial for iframe support - returns the iframe's document if the element is inside one.
 */
function getOwnerDocument(element: HTMLElement | null): Document {
  return element?.ownerDocument ?? document;
}

/**
 * Detect if an element is inside an iframe by checking if its document is different from the top document
 */
function isInIframe(element: HTMLElement | null): boolean {
  if (!element) return false;
  const doc = getOwnerDocument(element);
  return doc !== document;
}

export function useOnClickOutside<T extends HTMLElement>(
  ref: PossibleRef<T> | Array<PossibleRef<T>>,
  handler: (event: MouseEvent | TouchEvent | PointerEvent) => void,
  eventType?: "mousedown" | "mouseup" | "click" | "touchstart" | "pointerdown",
  options?: AddEventListenerOptions | boolean
): void {
  const handlerRef = useRef(handler);

  // Use useIsomorphicLayoutEffect to update handler ref synchronously
  // This prevents stale closures in rapid click scenarios where the event
  // listener (registered below) might fire before the ref is updated
  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const supportsPointerEvents =
      typeof window !== "undefined" &&
      typeof window.PointerEvent !== "undefined";
    const resolvedEventType =
      eventType ?? (supportsPointerEvents ? "pointerdown" : "mousedown");

    const refs = Array.isArray(ref) ? ref : [ref];

    // Detect the correct document to attach listeners to
    // If any ref is inside an iframe, use that iframe's document
    let targetDocument: Document = document;
    let inIframe = false;

    for (const currentRef of refs) {
      if (currentRef.current) {
        const refDocument = getOwnerDocument(currentRef.current);
        if (refDocument !== document) {
          targetDocument = refDocument;
          inIframe = true;
          break;
        }
      }
    }

    if (DEBUG_CLICK_OUTSIDE) {
      console.log("[useOnClickOutside] Setup:", {
        eventType: resolvedEventType,
        inIframe,
        documentLocation: inIframe ? "iframe" : "parent",
        refsCount: refs.length,
        refsWithNodes: refs.filter((r) => r.current).length,
      });
    }

    const listener = (event: MouseEvent | TouchEvent | PointerEvent) => {
      const target = event.target;

      if (DEBUG_CLICK_OUTSIDE) {
        console.log("[useOnClickOutside] Event fired:", {
          eventType: event.type,
          targetTag: target instanceof Element ? target.tagName : "unknown",
          targetInIframe: target instanceof Node ? isInIframe(target as HTMLElement) : false,
        });
      }

      if (typeof Node === "undefined" || !(target instanceof Node)) {
        if (DEBUG_CLICK_OUTSIDE) {
          console.log("[useOnClickOutside] Early return: target not a Node");
        }
        return;
      }

      const clickedInside = refs.some((currentRef) => {
        const node = currentRef.current;
        const contains = node ? node.contains(target) : false;

        if (DEBUG_CLICK_OUTSIDE && node) {
          console.log("[useOnClickOutside] Checking ref:", {
            refTag: node.tagName,
            contains,
            nodeInIframe: isInIframe(node),
          });
        }

        return contains;
      });

      if (DEBUG_CLICK_OUTSIDE) {
        console.log("[useOnClickOutside] Click result:", {
          clickedInside,
          willCallHandler: !clickedInside,
        });
      }

      if (!clickedInside) {
        handlerRef.current(event);
      }
    };

    targetDocument.addEventListener(resolvedEventType, listener, options);

    if (DEBUG_CLICK_OUTSIDE) {
      console.log("[useOnClickOutside] Listener attached to:", {
        documentType: inIframe ? "iframe document" : "parent document",
        eventType: resolvedEventType,
      });
    }

    return () => {
      targetDocument.removeEventListener(resolvedEventType, listener, options);

      if (DEBUG_CLICK_OUTSIDE) {
        console.log("[useOnClickOutside] Listener removed from:", {
          documentType: inIframe ? "iframe document" : "parent document",
        });
      }
    };
  }, [eventType, options, ref]);
}
