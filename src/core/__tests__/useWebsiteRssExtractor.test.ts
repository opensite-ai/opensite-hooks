import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { useWebsiteRssExtractor } from "../useWebsiteRssExtractor.js";

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
    ttlSeconds: 300,
    staleWhileRevalidateSeconds: 86400,
  },
};

describe("useWebsiteRssExtractor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should fetch rss data", async () => {
    const response = {
      ...baseMeta,
      feedUrl: "https://example.com/feed.xml",
      feeds: [
        {
          url: "https://example.com/feed.xml",
          feedType: "application/rss+xml",
          title: "Example Feed",
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
      useWebsiteRssExtractor({
        url: "https://example.com/",
        debounceMs: 0,
        refreshDebounceMs: 0,
      })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.data?.feedUrl).toBe("https://example.com/feed.xml");
    expect(result.current.data?.feeds.length).toBe(1);
    expect(result.current.meta?.status).toBe(200);
  });
});
