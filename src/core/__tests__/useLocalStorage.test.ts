import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLocalStorage } from "../useLocalStorage.js";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should return initial value when storage is empty", () => {
      const { result } = renderHook(() =>
        useLocalStorage("test-key", "default")
      );
      expect(result.current[0]).toBe("default");
    });

    it("should return stored value when present in storage", () => {
      localStorage.setItem("existing-key", JSON.stringify("stored-value"));

      const { result } = renderHook(() =>
        useLocalStorage("existing-key", "default")
      );
      expect(result.current[0]).toBe("stored-value");
    });

    it("should handle complex objects", () => {
      const complexObject = { name: "test", items: [1, 2, 3] };
      localStorage.setItem("object-key", JSON.stringify(complexObject));

      const { result } = renderHook(() =>
        useLocalStorage("object-key", { name: "", items: [] })
      );
      expect(result.current[0]).toEqual(complexObject);
    });
  });

  describe("setValue", () => {
    it("should update state and storage", () => {
      const { result } = renderHook(() =>
        useLocalStorage("update-key", "initial")
      );

      act(() => {
        result.current[1]("updated");
      });

      expect(result.current[0]).toBe("updated");
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "update-key",
        JSON.stringify("updated")
      );
    });

    it("should support function updater", () => {
      const { result } = renderHook(() => useLocalStorage("counter", 0));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);

      act(() => {
        result.current[1]((prev) => prev + 5);
      });

      expect(result.current[0]).toBe(6);
    });
  });

  describe("options", () => {
    it("should use custom serializer", () => {
      const serialize = vi.fn((value: number) => String(value * 2));

      const { result } = renderHook(() =>
        useLocalStorage("custom-serialize", 10, { serialize })
      );

      act(() => {
        result.current[1](20);
      });

      expect(serialize).toHaveBeenCalledWith(20);
    });

    it("should skip initialization with initializeWithValue: false", () => {
      localStorage.setItem("skip-init", JSON.stringify("stored"));

      const { result } = renderHook(() =>
        useLocalStorage("skip-init", "default", { initializeWithValue: false })
      );

      expect(result.current[0]).toBe("default");
    });
  });

  describe("key changes", () => {
    it("should read new key value when key changes", () => {
      localStorage.setItem("key-a", JSON.stringify("value-a"));
      localStorage.setItem("key-b", JSON.stringify("value-b"));

      const { result, rerender } = renderHook(
        ({ key }) => useLocalStorage(key, "default"),
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
        useLocalStorage("bool-key", false)
      );

      act(() => {
        result.current[1](true);
      });

      expect(result.current[0]).toBe(true);
    });

    it("should work with arrays", () => {
      const { result } = renderHook(() =>
        useLocalStorage<string[]>("array-key", [])
      );

      act(() => {
        result.current[1](["a", "b", "c"]);
      });

      expect(result.current[0]).toEqual(["a", "b", "c"]);
    });
  });
});

