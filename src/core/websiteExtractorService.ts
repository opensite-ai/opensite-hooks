import {
  DEFAULT_WEBSITE_EXTRACTOR_BASE_URL,
  type WebsiteExtractorClientResult,
  type WebsiteExtractorError,
  type WebsiteExtractorRequest,
} from "./websiteExtractorTypes.js";

const EXTRACTOR_PATH = "/api/v1/extract";

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export function buildWebsiteExtractorUrl(request: WebsiteExtractorRequest): string {
  const baseUrl = normalizeBaseUrl(
    request.baseUrl ?? DEFAULT_WEBSITE_EXTRACTOR_BASE_URL
  );
  const params = new URLSearchParams();

  if (request.apiKey) {
    params.set("api_key", request.apiKey);
  }

  params.set("url", request.url);

  return `${baseUrl}${EXTRACTOR_PATH}/${request.endpoint}?${params.toString()}`;
}

export async function fetchWebsiteExtractor<TResponse>(
  request: WebsiteExtractorRequest
): Promise<WebsiteExtractorClientResult<TResponse>> {
  if (!request.url || request.url.trim().length === 0) {
    return {
      ok: false,
      error: {
        message: "URL is required.",
      },
    };
  }

  const endpoint = buildWebsiteExtractorUrl(request);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      signal: request.signal,
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const errorPayload = payload as { error?: string; status?: number } | null;
      const error: WebsiteExtractorError = {
        message:
          errorPayload?.error ??
          `Request failed with status ${response.status}.`,
        status: errorPayload?.status ?? response.status,
        raw: payload,
      };

      return { ok: false, error };
    }

    return { ok: true, response: payload as TResponse };
  } catch (error) {
    if (request.signal?.aborted) {
      return {
        ok: false,
        error: {
          message: "Request aborted.",
        },
      };
    }

    return {
      ok: false,
      error: {
        message:
          error instanceof Error ? error.message : "Request failed unexpectedly.",
        raw: error,
      },
    };
  }
}
