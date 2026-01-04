import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSessionStorage } from "../useSessionStorage.js";

describe("useSessionStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should return initial value when storage is empty", () => {
      const { result } = renderHook(() =>
        useSessionStorage("test-key", "default")
      );
      expect(result.current[0]).toBe("default");
    });

    it("should return stored value when present in storage", () => {
      sessionStorage.setItem("existing-key", JSON.stringify("stored-value"));

      const { result } = renderHook(() =>
        useSessionStorage("existing-key", "default")
      );
      expect(result.current[0]).toBe("stored-value");
    });

    it("should handle complex objects", () => {
      const complexObject = { name: "test", count: 42 };
      sessionStorage.setItem("object-key", JSON.stringify(complexObject));

      const { result } = renderHook(() =>
        useSessionStorage("object-key", { name: "", count: 0 })
      );
      expect(result.current[0]).toEqual(complexObject);
    });
  });

  describe("setValue", () => {
    it("should update state and storage", () => {
      const { result } = renderHook(() =>
        useSessionStorage("update-key", "initial")
      );

      act(() => {
        result.current[1]("updated");
      });

      expect(result.current[0]).toBe("updated");
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        "update-key",
        JSON.stringify("updated")
      );
    });

    it("should support function updater", () => {
      const { result } = renderHook(() => useSessionStorage("counter", 0));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);

      act(() => {
        result.current[1]((prev) => prev * 10);
      });

      expect(result.current[0]).toBe(10);
    });
  });

  describe("options", () => {
    it("should use custom serializer", () => {
      const serialize = vi.fn((value: string) => value.toUpperCase());

      const { result } = renderHook(() =>
        useSessionStorage("custom-serialize", "test", { serialize })
      );

      act(() => {
        result.current[1]("hello");
      });

      expect(serialize).toHaveBeenCalledWith("hello");
    });

    it("should skip initialization with initializeWithValue: false", () => {
      sessionStorage.setItem("skip-init", JSON.stringify("stored"));

      const { result } = renderHook(() =>
        useSessionStorage("skip-init", "default", { initializeWithValue: false })
      );

      expect(result.current[0]).toBe("default");
    });
  });

  describe("key changes", () => {
    it("should read new key value when key changes", () => {
      sessionStorage.setItem("key-a", JSON.stringify("value-a"));
      sessionStorage.setItem("key-b", JSON.stringify("value-b"));

      const { result, rerender } = renderHook(
        ({ key }) => useSessionStorage(key, "default"),
        { initialProps: { key: "key-a" } }
      );

      expect(result.current[0]).toBe("value-a");

      rerender({ key: "key-b" });
      expect(result.current[0]).toBe("value-b");
    });
  });

  describe("types", () => {
    it("should work with boolean values", () => {
      const { result } = renderHook(() =>
        useSessionStorage("bool-key", true)
      );

      act(() => {
        result.current[1](false);
      });

      expect(result.current[0]).toBe(false);
    });

    it("should work with null", () => {
      const { result } = renderHook(() =>
        useSessionStorage<string | null>("nullable", null)
      );

      act(() => {
        result.current[1]("value");
      });

      expect(result.current[0]).toBe("value");

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
    });
  });
});

