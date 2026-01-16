import { useMemo, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";

export interface MapActions<K, V> {
  set: (key: K, value: V) => void;
  setAll: (entries: Map<K, V> | [K, V][]) => void;
  remove: (key: K) => void;
  clear: () => void;
  get: (key: K) => V | undefined;
  has: (key: K) => boolean;
}

export function useMap<K, V>(
  initialState?: Map<K, V> | [K, V][]
): [Map<K, V>, MapActions<K, V>] {
  const [map, setMap] = useState<Map<K, V>>(() => {
    if (initialState instanceof Map) {
      return new Map(initialState);
    }
    if (Array.isArray(initialState)) {
      return new Map(initialState);
    }
    return new Map();
  });

  const mapRef = useRef(map);

  // Use useIsomorphicLayoutEffect to update mapRef synchronously with state
  // This ensures get() and has() methods always read the current map state
  // without a timing window where they could return stale values
  useIsomorphicLayoutEffect(() => {
    mapRef.current = map;
  }, [map]);

  const actions = useMemo<MapActions<K, V>>(
    () => ({
      set: (key: K, value: V) => {
        setMap((prev) => {
          const next = new Map(prev);
          next.set(key, value);
          return next;
        });
      },
      setAll: (entries: Map<K, V> | [K, V][]) => {
        setMap(entries instanceof Map ? new Map(entries) : new Map(entries));
      },
      remove: (key: K) => {
        setMap((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
      },
      clear: () => setMap(new Map()),
      get: (key: K) => mapRef.current.get(key),
      has: (key: K) => mapRef.current.has(key),
    }),
    []
  );

  return [map, actions];
}
