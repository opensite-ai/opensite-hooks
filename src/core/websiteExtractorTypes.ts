export interface WebsiteExtractCacheMeta {
  hit: boolean;
  ageSeconds: number;
  ttlSeconds: number;
  staleWhileRevalidateSeconds: number;
}

export interface WebsiteExtractMeta {
  requestedUrl: string;
  finalUrl: string;
  url: string;
  normalizedUrl: string;
  status: number;
  contentType: string;
  fetchedAt: string;
  bodyBytes: number;
  bodyTruncated: boolean;
  maxBodyBytes: number;
  cache: WebsiteExtractCacheMeta;
}

export interface WebsiteExtractorError {
  message: string;
  status?: number;
  raw?: unknown;
}

export interface WebsiteExtractorOptions {
  url?: string;
  apiKey?: string;
  baseUrl?: string;
  debounceMs?: number;
  refreshDebounceMs?: number;
  enabled?: boolean;
  cache?: boolean;
}

export interface WebsiteExtractorState<TData, TRaw = TData> {
  loading: boolean;
  data?: TData;
  raw?: TRaw;
  meta?: WebsiteExtractMeta;
  error?: WebsiteExtractorError;
}

export interface WebsiteExtractorResult<TData, TRaw = TData>
  extends WebsiteExtractorState<TData, TRaw> {
  refresh: () => void;
}

export type WebsiteExtractorResponse<TPayload> = WebsiteExtractMeta & TPayload;

export interface WebsiteExtractorRequest {
  endpoint: string;
  url: string;
  apiKey?: string;
  baseUrl?: string;
  signal?: AbortSignal;
}

export type WebsiteExtractorClientResult<T> =
  | { ok: true; response: T }
  | { ok: false; error: WebsiteExtractorError };

export const DEFAULT_WEBSITE_EXTRACTOR_BASE_URL = "https://octane.buzz";

export const DEFAULT_EXTRACTOR_DEBOUNCE_MS = 250;

export const DEFAULT_EXTRACTOR_REFRESH_DEBOUNCE_MS = 150;

export const DEFAULT_EXTRACTOR_ENABLED = true;

export const DEFAULT_EXTRACTOR_CACHE = true;

export function extractWebsiteMeta(response: WebsiteExtractMeta): WebsiteExtractMeta {
  const {
    requestedUrl,
    finalUrl,
    url,
    normalizedUrl,
    status,
    contentType,
    fetchedAt,
    bodyBytes,
    bodyTruncated,
    maxBodyBytes,
    cache,
  } = response;

  return {
    requestedUrl,
    finalUrl,
    url,
    normalizedUrl,
    status,
    contentType,
    fetchedAt,
    bodyBytes,
    bodyTruncated,
    maxBodyBytes,
    cache,
  };
}

export function stripWebsiteMeta<TResponse extends WebsiteExtractMeta>(
  response: TResponse
): Omit<TResponse, keyof WebsiteExtractMeta> {
  const {
    requestedUrl: _requestedUrl,
    finalUrl: _finalUrl,
    url: _url,
    normalizedUrl: _normalizedUrl,
    status: _status,
    contentType: _contentType,
    fetchedAt: _fetchedAt,
    bodyBytes: _bodyBytes,
    bodyTruncated: _bodyTruncated,
    maxBodyBytes: _maxBodyBytes,
    cache: _cache,
    ...payload
  } = response;

  return payload;
}
