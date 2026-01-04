import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useBoolean } from "../useBoolean.js";

describe("useBoolean", () => {
  describe("initialization", () => {
    it("should initialize with default value of false", () => {
      const { result } = renderHook(() => useBoolean());
      expect(result.current.value).toBe(false);
    });

    it("should initialize with provided default value of true", () => {
      const { result } = renderHook(() => useBoolean(true));
      expect(result.current.value).toBe(true);
    });

    it("should initialize with provided default value of false", () => {
      const { result } = renderHook(() => useBoolean(false));
      expect(result.current.value).toBe(false);
    });
  });

  describe("setTrue", () => {
    it("should set value to true", () => {
      const { result } = renderHook(() => useBoolean(false));

      act(() => {
        result.current.setTrue();
      });

      expect(result.current.value).toBe(true);
    });

    it("should keep value true when already true", () => {
      const { result } = renderHook(() => useBoolean(true));

      act(() => {
        result.current.setTrue();
      });

      expect(result.current.value).toBe(true);
    });
  });

  describe("setFalse", () => {
    it("should set value to false", () => {
      const { result } = renderHook(() => useBoolean(true));

      act(() => {
        result.current.setFalse();
      });

      expect(result.current.value).toBe(false);
    });

    it("should keep value false when already false", () => {
      const { result } = renderHook(() => useBoolean(false));

      act(() => {
        result.current.setFalse();
      });

      expect(result.current.value).toBe(false);
    });
  });

  describe("toggle", () => {
    it("should toggle from false to true", () => {
      const { result } = renderHook(() => useBoolean(false));

      act(() => {
        result.current.toggle();
      });

      expect(result.current.value).toBe(true);
    });

    it("should toggle from true to false", () => {
      const { result } = renderHook(() => useBoolean(true));

      act(() => {
        result.current.toggle();
      });

      expect(result.current.value).toBe(false);
    });

    it("should toggle multiple times correctly", () => {
      const { result } = renderHook(() => useBoolean(false));

      act(() => {
        result.current.toggle();
      });
      expect(result.current.value).toBe(true);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.value).toBe(false);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.value).toBe(true);
    });
  });

  describe("setValue", () => {
    it("should set value directly", () => {
      const { result } = renderHook(() => useBoolean(false));

      act(() => {
        result.current.setValue(true);
      });

      expect(result.current.value).toBe(true);
    });
  });

  describe("callback stability", () => {
    it("should maintain stable callback references across re-renders", () => {
      const { result, rerender } = renderHook(() => useBoolean());

      const initialSetTrue = result.current.setTrue;
      const initialSetFalse = result.current.setFalse;
      const initialToggle = result.current.toggle;

      rerender();

      expect(result.current.setTrue).toBe(initialSetTrue);
      expect(result.current.setFalse).toBe(initialSetFalse);
      expect(result.current.toggle).toBe(initialToggle);
    });
  });
});

