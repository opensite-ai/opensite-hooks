import { render, fireEvent } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useRef, type RefObject } from "react";
import { useHover } from "../useHover.js";

// Test component that uses the hook
function TestComponent({ onHoverChange }: { onHoverChange: (h: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useHover(ref);

  // Report hover state changes
  onHoverChange(isHovered);

  return <div ref={ref} data-testid="hover-target">Hover me</div>;
}

describe("useHover", () => {
  describe("initialization", () => {
    it("should initialize with false", () => {
      const ref = { current: document.createElement("div") };
      const { result } = renderHook(() => useHover(ref as RefObject<HTMLDivElement>));
      expect(result.current).toBe(false);
    });
  });

  describe("hover interactions", () => {
    it("should set true on pointer enter", () => {
      const hoverStates: boolean[] = [];
      const { getByTestId } = render(
        <TestComponent onHoverChange={(h) => hoverStates.push(h)} />
      );

      const target = getByTestId("hover-target");

      // Initial render
      expect(hoverStates[hoverStates.length - 1]).toBe(false);

      // Fire pointer enter
      fireEvent.pointerEnter(target);

      expect(hoverStates[hoverStates.length - 1]).toBe(true);
    });

    it("should set false on pointer leave", () => {
      const hoverStates: boolean[] = [];
      const { getByTestId } = render(
        <TestComponent onHoverChange={(h) => hoverStates.push(h)} />
      );

      const target = getByTestId("hover-target");

      fireEvent.pointerEnter(target);
      expect(hoverStates[hoverStates.length - 1]).toBe(true);

      fireEvent.pointerLeave(target);
      expect(hoverStates[hoverStates.length - 1]).toBe(false);
    });

    it("should handle multiple enter/leave cycles", () => {
      const hoverStates: boolean[] = [];
      const { getByTestId } = render(
        <TestComponent onHoverChange={(h) => hoverStates.push(h)} />
      );

      const target = getByTestId("hover-target");

      fireEvent.pointerEnter(target);
      expect(hoverStates[hoverStates.length - 1]).toBe(true);

      fireEvent.pointerLeave(target);
      expect(hoverStates[hoverStates.length - 1]).toBe(false);

      fireEvent.pointerEnter(target);
      expect(hoverStates[hoverStates.length - 1]).toBe(true);

      fireEvent.pointerLeave(target);
      expect(hoverStates[hoverStates.length - 1]).toBe(false);
    });
  });

  describe("with null ref", () => {
    it("should return false when ref.current is null", () => {
      const ref = { current: null };
      const { result } = renderHook(() => useHover(ref as RefObject<HTMLDivElement>));
      expect(result.current).toBe(false);
    });
  });
});

