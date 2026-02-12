import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useRef } from "react";
import { useOnClickOutside } from "../useOnClickOutside.js";

type OutsideEventType = "mousedown" | "mouseup" | "click" | "touchstart" | "pointerdown";

// Test component that uses the hook
function TestComponent({
  onClickOutside,
  eventType,
}: {
  onClickOutside: () => void;
  eventType?: OutsideEventType;
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

      fireEvent.pointerDown(getByTestId("outside"));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should not call handler when clicking inside", () => {
      const handler = vi.fn();
      const { getByTestId } = render(<TestComponent onClickOutside={handler} />);

      fireEvent.pointerDown(getByTestId("inside"));

      expect(handler).not.toHaveBeenCalled();
    });

    it("should not call handler when clicking the element itself", () => {
      const handler = vi.fn();
      const { getByTestId } = render(<TestComponent onClickOutside={handler} />);

      fireEvent.pointerDown(getByTestId("inside"));

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("default event selection", () => {
    it("should register pointerdown by default when PointerEvent is available", () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
      const handler = vi.fn();

      try {
        const { unmount } = render(<TestComponent onClickOutside={handler} />);

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          "pointerdown",
          expect.any(Function),
          undefined
        );

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          "pointerdown",
          expect.any(Function),
          undefined
        );
      } finally {
        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
      }
    });

    it("should fall back to mousedown when PointerEvent is unavailable", () => {
      const pointerEventDescriptor = Object.getOwnPropertyDescriptor(
        window,
        "PointerEvent"
      );
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");
      const handler = vi.fn();

      try {
        Object.defineProperty(window, "PointerEvent", {
          configurable: true,
          writable: true,
          value: undefined,
        });

        render(<TestComponent onClickOutside={handler} />);

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          "mousedown",
          expect.any(Function),
          undefined
        );
      } finally {
        if (pointerEventDescriptor) {
          Object.defineProperty(window, "PointerEvent", pointerEventDescriptor);
        } else {
          Reflect.deleteProperty(window, "PointerEvent");
        }
        addEventListenerSpy.mockRestore();
      }
    });
  });

  describe("event types", () => {
    it("should work with mousedown event", () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <TestComponent onClickOutside={handler} eventType="mousedown" />
      );

      fireEvent.mouseDown(getByTestId("outside"));

      expect(handler).toHaveBeenCalledTimes(1);
    });

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

      fireEvent.pointerDown(getByTestId("inside-1"));
      fireEvent.pointerDown(getByTestId("inside-2"));

      expect(handler).not.toHaveBeenCalled();
    });

    it("should call handler when clicking outside all refs", () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <MultiRefComponent onClickOutside={handler} />
      );

      fireEvent.pointerDown(getByTestId("outside"));

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
