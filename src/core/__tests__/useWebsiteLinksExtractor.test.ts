import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { useWebsiteLinksExtractor } from "../useWebsiteLinksExtractor.js";

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

describe("useWebsiteLinksExtractor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should fetch links data and support refresh", async () => {
    const response = {
      ...baseMeta,
      totalLinks: 2,
      uniqueDomains: 1,
      links: [
        {
          url: "https://example.com/",
          text: "Example",
          isExternal: false,
          domain: "example.com",
        },
      ],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => response,
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useWebsiteLinksExtractor({
        url: "https://example.com/",
        debounceMs: 0,
        refreshDebounceMs: 0,
      })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.data?.totalLinks).toBe(2);
    expect(result.current.data?.links.length).toBe(1);

    act(() => {
      result.current.refresh();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
