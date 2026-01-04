import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useMap } from "../useMap.js";

describe("useMap", () => {
  describe("initialization", () => {
    it("should initialize with empty map by default", () => {
      const { result } = renderHook(() => useMap<string, number>());
      expect(result.current[0].size).toBe(0);
    });

    it("should initialize with Map instance", () => {
      const initialMap = new Map([["a", 1], ["b", 2]]);
      const { result } = renderHook(() => useMap(initialMap));
      expect(result.current[0].size).toBe(2);
      expect(result.current[0].get("a")).toBe(1);
      expect(result.current[0].get("b")).toBe(2);
    });

    it("should initialize with array of entries", () => {
      const { result } = renderHook(() =>
        useMap<string, number>([["x", 10], ["y", 20]])
      );
      expect(result.current[0].size).toBe(2);
      expect(result.current[0].get("x")).toBe(10);
      expect(result.current[0].get("y")).toBe(20);
    });
  });

  describe("set", () => {
    it("should add new entry", () => {
      const { result } = renderHook(() => useMap<string, number>());

      act(() => {
        result.current[1].set("key", 100);
      });

      expect(result.current[0].get("key")).toBe(100);
      expect(result.current[0].size).toBe(1);
    });

    it("should update existing entry", () => {
      const { result } = renderHook(() => useMap<string, number>([["key", 1]]));

      act(() => {
        result.current[1].set("key", 999);
      });

      expect(result.current[0].get("key")).toBe(999);
      expect(result.current[0].size).toBe(1);
    });
  });

  describe("setAll", () => {
    it("should replace all entries with array", () => {
      const { result } = renderHook(() =>
        useMap<string, number>([["old", 1]])
      );

      act(() => {
        result.current[1].setAll([["new1", 10], ["new2", 20]]);
      });

      expect(result.current[0].size).toBe(2);
      expect(result.current[0].has("old")).toBe(false);
      expect(result.current[0].get("new1")).toBe(10);
    });

    it("should replace all entries with Map", () => {
      const { result } = renderHook(() => useMap<string, number>());
      const newMap = new Map([["a", 1], ["b", 2], ["c", 3]]);

      act(() => {
        result.current[1].setAll(newMap);
      });

      expect(result.current[0].size).toBe(3);
    });
  });

  describe("remove", () => {
    it("should remove entry by key", () => {
      const { result } = renderHook(() =>
        useMap<string, number>([["a", 1], ["b", 2]])
      );

      act(() => {
        result.current[1].remove("a");
      });

      expect(result.current[0].size).toBe(1);
      expect(result.current[0].has("a")).toBe(false);
      expect(result.current[0].has("b")).toBe(true);
    });

    it("should handle removing non-existent key", () => {
      const { result } = renderHook(() => useMap<string, number>([["a", 1]]));

      act(() => {
        result.current[1].remove("nonexistent");
      });

      expect(result.current[0].size).toBe(1);
    });
  });

  describe("clear", () => {
    it("should remove all entries", () => {
      const { result } = renderHook(() =>
        useMap<string, number>([["a", 1], ["b", 2], ["c", 3]])
      );

      act(() => {
        result.current[1].clear();
      });

      expect(result.current[0].size).toBe(0);
    });
  });

  describe("get and has", () => {
    it("should return value for existing key", () => {
      const { result } = renderHook(() => useMap<string, number>([["key", 42]]));
      expect(result.current[1].get("key")).toBe(42);
    });

    it("should return undefined for non-existent key", () => {
      const { result } = renderHook(() => useMap<string, number>());
      expect(result.current[1].get("missing")).toBeUndefined();
    });

    it("should check key existence correctly", () => {
      const { result } = renderHook(() => useMap<string, number>([["exists", 1]]));
      expect(result.current[1].has("exists")).toBe(true);
      expect(result.current[1].has("missing")).toBe(false);
    });
  });

  describe("callback stability", () => {
    it("should maintain stable action references", () => {
      const { result, rerender } = renderHook(() => useMap<string, number>());

      const initialActions = result.current[1];
      rerender();

      expect(result.current[1].set).toBe(initialActions.set);
      expect(result.current[1].remove).toBe(initialActions.remove);
      expect(result.current[1].clear).toBe(initialActions.clear);
    });
  });
});

