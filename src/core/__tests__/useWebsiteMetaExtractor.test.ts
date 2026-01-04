import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { useWebsiteMetaExtractor } from "../useWebsiteMetaExtractor.js";

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

describe("useWebsiteMetaExtractor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should fetch meta data", async () => {
    const response = {
      ...baseMeta,
      title: "Example Page",
      description: "Example description",
      language: "en",
      canonicalUrl: "https://example.com/",
      feedUrl: null,
      textContentLength: 42,
      metaTags: {
        description: "Example description",
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => response,
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useWebsiteMetaExtractor({
        url: "https://example.com/",
        debounceMs: 0,
        refreshDebounceMs: 0,
      })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.data?.title).toBe("Example Page");
    expect(result.current.data?.metaTags.description).toBe(
      "Example description"
    );
    expect(result.current.meta?.status).toBe(200);
  });
});
