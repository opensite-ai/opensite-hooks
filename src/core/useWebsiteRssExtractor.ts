import { useCallback } from "react";
import { useWebsiteExtractorBase } from "./useWebsiteExtractorBase.js";
import type {
  WebsiteExtractorOptions,
  WebsiteExtractorResponse,
  WebsiteExtractorResult,
  WebsiteExtractMeta,
} from "./websiteExtractorTypes.js";

export interface WebsiteRssFeed {
  url: string;
  feedType: string;
  title?: string | null;
}

export interface WebsiteRssPayload {
  feedUrl?: string | null;
  feeds: WebsiteRssFeed[];
}

export type WebsiteRssResponse = WebsiteExtractorResponse<WebsiteRssPayload>;

export function useWebsiteRssExtractor(
  options: WebsiteExtractorOptions
): WebsiteExtractorResult<WebsiteRssPayload, WebsiteRssResponse> {
  const selectData = useCallback(
    (
      payload: Omit<WebsiteRssResponse, keyof WebsiteExtractMeta>
    ): WebsiteRssPayload => {
      return {
        feedUrl: payload.feedUrl ?? null,
        feeds: payload.feeds ?? [],
      };
    },
    []
  );

  return useWebsiteExtractorBase<WebsiteRssResponse, WebsiteRssPayload>({
    endpoint: "rss",
    options,
    selectData,
  });
}
