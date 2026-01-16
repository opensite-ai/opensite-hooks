import { useCallback, useMemo, useState } from "react";

export interface UseBooleanResult {
  value: boolean;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}

export function useBoolean(defaultValue = false): UseBooleanResult {
  const [value, setValue] = useState<boolean>(defaultValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((current) => !current), []);

  // Memoize the return object to prevent unnecessary re-renders in consumers
  // that use the result object in dependency arrays
  return useMemo(
    () => ({ value, setValue, setTrue, setFalse, toggle }),
    [value, setValue, setTrue, setFalse, toggle]
  );
}
