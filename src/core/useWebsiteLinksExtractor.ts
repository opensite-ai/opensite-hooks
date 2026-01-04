import { useCallback } from "react";
import { useWebsiteExtractorBase } from "./useWebsiteExtractorBase.js";
import type {
  WebsiteExtractorOptions,
  WebsiteExtractorResponse,
  WebsiteExtractorResult,
  WebsiteExtractMeta,
} from "./websiteExtractorTypes.js";

export interface WebsiteLinkRecord {
  url: string;
  text: string;
  isExternal: boolean;
  domain?: string | null;
}

export interface WebsiteLinksPayload {
  totalLinks: number;
  uniqueDomains: number;
  links: WebsiteLinkRecord[];
}

export type WebsiteLinksResponse = WebsiteExtractorResponse<WebsiteLinksPayload>;

export function useWebsiteLinksExtractor(
  options: WebsiteExtractorOptions
): WebsiteExtractorResult<WebsiteLinksPayload, WebsiteLinksResponse> {
  const selectData = useCallback(
    (
      payload: Omit<WebsiteLinksResponse, keyof WebsiteExtractMeta>
    ): WebsiteLinksPayload => {
      return {
        totalLinks: payload.totalLinks ?? 0,
        uniqueDomains: payload.uniqueDomains ?? 0,
        links: payload.links ?? [],
      };
    },
    []
  );

  return useWebsiteExtractorBase<WebsiteLinksResponse, WebsiteLinksPayload>({
    endpoint: "links",
    options,
    selectData,
  });
}
