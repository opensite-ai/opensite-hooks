import { useCallback } from "react";
import { useWebsiteExtractorBase } from "./useWebsiteExtractorBase.js";
import type {
  WebsiteExtractorOptions,
  WebsiteExtractorResponse,
  WebsiteExtractorResult,
  WebsiteExtractMeta,
} from "./websiteExtractorTypes.js";

export interface WebsiteMetaPayload {
  title?: string | null;
  description?: string | null;
  language?: string | null;
  canonicalUrl?: string | null;
  feedUrl?: string | null;
  textContentLength?: number | null;
  metaTags: Record<string, string>;
}

export type WebsiteMetaResponse = WebsiteExtractorResponse<WebsiteMetaPayload>;

export function useWebsiteMetaExtractor(
  options: WebsiteExtractorOptions
): WebsiteExtractorResult<WebsiteMetaPayload, WebsiteMetaResponse> {
  const selectData = useCallback(
    (
      payload: Omit<WebsiteMetaResponse, keyof WebsiteExtractMeta>
    ): WebsiteMetaPayload => {
      return {
        title: payload.title ?? undefined,
        description: payload.description ?? undefined,
        language: payload.language ?? undefined,
        canonicalUrl: payload.canonicalUrl ?? undefined,
        feedUrl: payload.feedUrl ?? null,
        textContentLength: payload.textContentLength ?? undefined,
        metaTags: payload.metaTags ?? {},
      };
    },
    []
  );

  return useWebsiteExtractorBase<WebsiteMetaResponse, WebsiteMetaPayload>({
    endpoint: "meta",
    options,
    selectData,
  });
}
