import { useCallback, useEffect, useRef, useState } from "react";

export interface StorageOptions<T> {
  initializeWithValue?: boolean;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  listenToStorageChanges?: boolean;
}

type StoredSetter<T> = (value: T | ((current: T) => T)) => void;

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: StorageOptions<T> = {}
): [T, StoredSetter<T>] {
  const {
    initializeWithValue = true,
    serialize = JSON.stringify,
    deserialize = JSON.parse as (value: string) => T,
    listenToStorageChanges = true,
  } = options;

  const initialValueRef = useRef(initialValue);

  const readValue = useCallback(() => {
    if (typeof window === "undefined") {
      return initialValueRef.current;
    }
    if (!initializeWithValue) {
      return initialValueRef.current;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValueRef.current;
    } catch {
      return initialValueRef.current;
    }
  }, [deserialize, initializeWithValue, key]);

  const [storedValue, setStoredValue] = useState<T>(() => readValue());

  const setValue: StoredSetter<T> = useCallback(
    (value) => {
      setStoredValue((current) => {
        const valueToStore =
          typeof value === "function"
            ? (value as (current: T) => T)(current)
            : value;
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(key, serialize(valueToStore));
          } catch {
            // Ignore write errors (quota/security)
          }
        }
        return valueToStore;
      });
    },
    [key, serialize]
  );

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    if (typeof window === "undefined" || !listenToStorageChanges) {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) {
        return;
      }
      if (event.newValue === null) {
        setStoredValue(initialValueRef.current);
        return;
      }
      try {
        setStoredValue(deserialize(event.newValue));
      } catch {
        setStoredValue(initialValueRef.current);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [deserialize, key, listenToStorageChanges]);

  return [storedValue, setValue];
}
