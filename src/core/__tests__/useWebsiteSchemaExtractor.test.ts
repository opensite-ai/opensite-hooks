import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { useWebsiteSchemaExtractor } from "../useWebsiteSchemaExtractor.js";

const baseMeta = {
  requestedUrl: "https://example.com/",
  finalUrl: "https://example.com/",
  url: "https://example.com/",
  normalizedUrl: "https://example.com/",
  status: 200,
  contentType: "text/html; charset=utf-8",
  fetchedAt: "2026-01-01T00:00:00Z",
  bodyBytes: 1200,
  bodyTruncated: false,
  maxBodyBytes: 6000000,
  cache: {
    hit: false,
    ageSeconds: 0,
    ttlSeconds: 3600,
    staleWhileRevalidateSeconds: 86400,
  },
};

describe("useWebsiteSchemaExtractor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should fetch schema data", async () => {
    const response = {
      ...baseMeta,
      schema: [
        {
          schema_type: "Article",
          value: {
            "@type": "Article",
            headline: "Example Headline",
          },
        },
      ],
      schemaTypes: ["Article"],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => response,
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useWebsiteSchemaExtractor({
        url: "https://example.com/",
        debounceMs: 0,
        refreshDebounceMs: 0,
      })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.data?.schemaTypes).toEqual(["Article"]);
    expect(result.current.meta?.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("should surface error responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        error: "Upstream returned status 500",
        status: 503,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useWebsiteSchemaExtractor({
        url: "https://example.com/",
        debounceMs: 0,
        refreshDebounceMs: 0,
      })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.error?.message).toBe("Upstream returned status 500");
    expect(result.current.loading).toBe(false);
  });
});
