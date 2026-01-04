import { useCallback } from "react";
import { useWebsiteExtractorBase } from "./useWebsiteExtractorBase.js";
import type {
  WebsiteExtractorOptions,
  WebsiteExtractorResponse,
  WebsiteExtractorResult,
  WebsiteExtractMeta,
} from "./websiteExtractorTypes.js";

export interface WebsiteSchemaRecord {
  schema_type: string;
  value: Record<string, unknown>;
}

export interface WebsiteSchemaPayload {
  schema: WebsiteSchemaRecord[];
  schemaTypes: string[];
}

export type WebsiteSchemaResponse = WebsiteExtractorResponse<WebsiteSchemaPayload>;

export function useWebsiteSchemaExtractor(
  options: WebsiteExtractorOptions
): WebsiteExtractorResult<WebsiteSchemaPayload, WebsiteSchemaResponse> {
  const selectData = useCallback(
    (
      payload: Omit<WebsiteSchemaResponse, keyof WebsiteExtractMeta>
    ): WebsiteSchemaPayload => {
      return {
        schema: payload.schema ?? [],
        schemaTypes: payload.schemaTypes ?? [],
      };
    },
    []
  );

  return useWebsiteExtractorBase<WebsiteSchemaResponse, WebsiteSchemaPayload>({
    endpoint: "schema",
    options,
    selectData,
  });
}
