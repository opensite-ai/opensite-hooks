import { useCallback, useMemo } from "react";
import { useWebsiteExtractorBase } from "./useWebsiteExtractorBase.js";
import type {
  WebsiteExtractorOptions,
  WebsiteExtractorResponse,
  WebsiteExtractorResult,
  WebsiteExtractMeta,
} from "./websiteExtractorTypes.js";

export interface OpenGraphImage {
  url?: string | null;
  height?: string | null;
  width?: string | null;
}

export interface OpenGraphVideo {
  url?: string | null;
  height?: string | null;
  width?: string | null;
}

export interface OpenGraphData {
  description?: string | null;
  title?: string | null;
  site_name?: string | null;
  image?: OpenGraphImage | null;
  video?: OpenGraphVideo | null;
  url?: string | null;
  ogType?: string | null;
}

export interface OpenGraphHtmlInferredData {
  description?: string | null;
  title?: string | null;
  type?: string | null;
  videoType?: string | null;
  url?: string | null;
  favicon?: string | null;
  images?: string[] | null;
  image?: string | null;
  site_name?: string | null;
}

export interface OpenGraphHybridData {
  description?: string | null;
  title?: string | null;
  type?: string | null;
  image?: string | null;
  video?: string | null;
  videoType?: string | null;
  favicon?: string | null;
  site_name?: string | null;
  url?: string | null;
  videoWidth?: number | null;
  videoHeight?: number | null;
}

export type OpenGraphResponse = WebsiteExtractorResponse<{
  openGraph: OpenGraphData;
  htmlInferred: OpenGraphHtmlInferredData;
  hybridGraph: OpenGraphHybridData;
}>;

export interface OpenGraphSummary {
  description?: string;
  favicon?: string;
  image?: string;
  video?: string;
  videoType?: string;
  siteName?: string;
  title?: string;
  url: string;
  siteHost?: string;
}

export interface OpenGraphExtractorOptions extends WebsiteExtractorOptions {
  skipPatterns?: RegExp[];
}

const DEFAULT_SKIP_PATTERNS = [
  /search\.google\.com\/local\/reviews/i,
  /google\.com\/maps\/place/i,
  /maps\.google\.com/i,
  /opentable\.com/i,
];

const pickFirstString = (
  ...values: Array<string | null | undefined>
): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const safeHost = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return undefined;
  }
};

export function useOpenGraphExtractor(
  options: OpenGraphExtractorOptions
): WebsiteExtractorResult<OpenGraphSummary, OpenGraphResponse> {
  const skipPatterns = useMemo(
    () => options.skipPatterns ?? DEFAULT_SKIP_PATTERNS,
    [options.skipPatterns]
  );

  const shouldSkip = useCallback(
    (url: string) => skipPatterns.some((pattern) => pattern.test(url)),
    [skipPatterns]
  );

  const selectData = useCallback(
    (
      payload: Omit<OpenGraphResponse, keyof WebsiteExtractMeta>,
      _raw: OpenGraphResponse,
      meta: WebsiteExtractMeta
    ): OpenGraphSummary => {
      const { openGraph, htmlInferred, hybridGraph } = payload;

      const description = pickFirstString(
        openGraph?.description,
        hybridGraph?.description,
        htmlInferred?.description
      );
      const title = pickFirstString(
        openGraph?.title,
        hybridGraph?.title,
        htmlInferred?.title
      );
      const siteName = pickFirstString(
        openGraph?.site_name,
        hybridGraph?.site_name,
        htmlInferred?.site_name
      );
      const favicon = pickFirstString(
        hybridGraph?.favicon,
        htmlInferred?.favicon
      );
      const image = pickFirstString(
        openGraph?.image?.url ?? undefined,
        hybridGraph?.image ?? undefined,
        htmlInferred?.image ?? undefined,
        htmlInferred?.images?.[0]
      );
      const video = pickFirstString(
        openGraph?.video?.url ?? undefined,
        hybridGraph?.video ?? undefined
      );
      const videoType = pickFirstString(
        hybridGraph?.videoType,
        htmlInferred?.videoType
      );
      const resolvedUrl =
        pickFirstString(
          meta.url,
          openGraph?.url ?? undefined,
          hybridGraph?.url ?? undefined,
          htmlInferred?.url ?? undefined,
          meta.finalUrl,
          meta.normalizedUrl,
          meta.requestedUrl
        ) ?? "";

      return {
        description,
        favicon,
        image,
        video,
        videoType,
        siteName,
        title,
        url: resolvedUrl,
        siteHost: safeHost(resolvedUrl),
      };
    },
    []
  );

  return useWebsiteExtractorBase<OpenGraphResponse, OpenGraphSummary>({
    endpoint: "open-graph",
    options,
    selectData,
    shouldSkip,
  });
}
