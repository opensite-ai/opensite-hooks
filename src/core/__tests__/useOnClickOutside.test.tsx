import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useRef } from "react";
import { useOnClickOutside } from "../useOnClickOutside.js";

// Test component that uses the hook
function TestComponent({
  onClickOutside,
  eventType = "mousedown" as const,
}: {
  onClickOutside: () => void;
  eventType?: "mousedown" | "mouseup" | "click" | "touchstart" | "pointerdown";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, onClickOutside, eventType);

  return (
    <div data-testid="container">
      <div ref={ref} data-testid="inside">
        Inside content
      </div>
      <div data-testid="outside">Outside content</div>
    </div>
  );
}

describe("useOnClickOutside", () => {
  describe("click detection", () => {
    it("should call handler when clicking outside", () => {
      const handler = vi.fn();
      const { getByTestId } = render(<TestComponent onClickOutside={handler} />);

      fireEvent.mouseDown(getByTestId("outside"));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should not call handler when clicking inside", () => {
      const handler = vi.fn();
      const { getByTestId } = render(<TestComponent onClickOutside={handler} />);

      fireEvent.mouseDown(getByTestId("inside"));

      expect(handler).not.toHaveBeenCalled();
    });

    it("should not call handler when clicking the element itself", () => {
      const handler = vi.fn();
      const { getByTestId } = render(<TestComponent onClickOutside={handler} />);

      fireEvent.mouseDown(getByTestId("inside"));

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("event types", () => {
    it("should work with mouseup event", () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <TestComponent onClickOutside={handler} eventType="mouseup" />
      );

      fireEvent.mouseUp(getByTestId("outside"));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should work with click event", () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <TestComponent onClickOutside={handler} eventType="click" />
      );

      fireEvent.click(getByTestId("outside"));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should work with pointerdown event", () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <TestComponent onClickOutside={handler} eventType="pointerdown" />
      );

      fireEvent.pointerDown(getByTestId("outside"));

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("multiple refs", () => {
    function MultiRefComponent({ onClickOutside }: { onClickOutside: () => void }) {
      const ref1 = useRef<HTMLDivElement>(null);
      const ref2 = useRef<HTMLDivElement>(null);
      useOnClickOutside([ref1, ref2], onClickOutside);

      return (
        <div data-testid="container">
          <div ref={ref1} data-testid="inside-1">Inside 1</div>
          <div ref={ref2} data-testid="inside-2">Inside 2</div>
          <div data-testid="outside">Outside</div>
        </div>
      );
    }

    it("should not call handler when clicking any ref", () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <MultiRefComponent onClickOutside={handler} />
      );

      fireEvent.mouseDown(getByTestId("inside-1"));
      fireEvent.mouseDown(getByTestId("inside-2"));

      expect(handler).not.toHaveBeenCalled();
    });

    it("should call handler when clicking outside all refs", () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <MultiRefComponent onClickOutside={handler} />
      );

      fireEvent.mouseDown(getByTestId("outside"));

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});

