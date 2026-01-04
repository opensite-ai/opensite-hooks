import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { useOpenGraphExtractor } from "../useOpenGraphExtractor.js";

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

describe("useOpenGraphExtractor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should fetch and serialize open graph data", async () => {
    const response = {
      ...baseMeta,
      openGraph: {
        description: "Example description",
        title: "Example Title",
        site_name: "Example Site",
        image: { url: "https://example.com/og.jpg" },
        video: null,
        url: "https://example.com/",
        ogType: "website",
      },
      htmlInferred: {
        description: "Fallback description",
        title: "Fallback Title",
        type: "website",
        url: "https://example.com/",
        favicon: "https://example.com/favicon.ico",
        images: ["https://example.com/fallback.jpg"],
        image: "https://example.com/fallback.jpg",
        site_name: "example.com",
      },
      hybridGraph: {
        description: "Hybrid description",
        title: "Hybrid Title",
        type: "website",
        image: "https://example.com/hybrid.jpg",
        video: null,
        videoType: "unknown",
        favicon: "https://example.com/favicon.ico",
        site_name: "Example Site",
        url: "https://example.com/",
        videoWidth: null,
        videoHeight: null,
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => response,
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useOpenGraphExtractor({
        url: "https://example.com/",
        debounceMs: 0,
        refreshDebounceMs: 0,
      })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.data?.title).toBe("Example Title");
    expect(result.current.data?.image).toBe("https://example.com/og.jpg");
    expect(result.current.meta?.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/extract/open-graph");
  });

  it("should skip URLs that match default skip patterns", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useOpenGraphExtractor({
        url: "https://maps.google.com/?q=phoenix",
        debounceMs: 0,
        refreshDebounceMs: 0,
      })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
