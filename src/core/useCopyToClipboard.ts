import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseCopyToClipboardOptions {
  resetDelay?: number;
}

export interface CopyToClipboardResult {
  copy: (text: string) => Promise<boolean>;
  copiedText: string | null;
  isSupported: boolean;
}

export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): CopyToClipboardResult {
  const resetDelay = options.resetDelay ?? 2000;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const isSupported = useMemo(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      return true;
    }
    if (typeof document === "undefined") {
      return false;
    }
    if (typeof document.queryCommandSupported !== "function") {
      return false;
    }
    return document.queryCommandSupported("copy");
  }, []);

  const resetCopied = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCopiedText(null);
    }, resetDelay);
  }, [resetDelay]);

  const copy = useCallback(
    async (text: string) => {
      if (!isSupported) {
        return false;
      }

      const shouldUseClipboardApi =
        typeof navigator !== "undefined" && !!navigator.clipboard;

      try {
        if (shouldUseClipboardApi) {
          await navigator.clipboard.writeText(text);
        } else if (typeof document !== "undefined") {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "fixed";
          textarea.style.left = "-9999px";
          textarea.style.top = "0";
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const success = document.execCommand("copy");
          document.body.removeChild(textarea);
          if (!success) {
            return false;
          }
        }

        setCopiedText(text);
        resetCopied();
        return true;
      } catch {
        return false;
      }
    },
    [isSupported, resetCopied]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copy, copiedText, isSupported };
}
