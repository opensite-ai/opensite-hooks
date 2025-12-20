import { useCallback, useState } from "react";
import { useEventListener } from "./useEventListener.js";

export function useHover<T extends HTMLElement>(
  ref: React.RefObject<T>
): boolean {
  const [isHovered, setIsHovered] = useState(false);

  const handleEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  useEventListener("pointerenter", handleEnter, ref);
  useEventListener("pointerleave", handleLeave, ref);

  return isHovered;
}
