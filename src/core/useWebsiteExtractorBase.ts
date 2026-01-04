import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounceCallback } from "./useDebounceCallback.js";
import { useDebounceValue } from "./useDebounceValue.js";
import { useIsClient } from "./useIsClient.js";
import { useMap } from "./useMap.js";
import { fetchWebsiteExtractor } from "./websiteExtractorService.js";
import {
  DEFAULT_EXTRACTOR_CACHE,
  DEFAULT_EXTRACTOR_DEBOUNCE_MS,
  DEFAULT_EXTRACTOR_ENABLED,
  DEFAULT_EXTRACTOR_REFRESH_DEBOUNCE_MS,
  DEFAULT_WEBSITE_EXTRACTOR_BASE_URL,
  extractWebsiteMeta,
  stripWebsiteMeta,
  type WebsiteExtractorOptions,
  type WebsiteExtractorResult,
  type WebsiteExtractorState,
  type WebsiteExtractMeta,
} from "./websiteExtractorTypes.js";

interface CachedExtractorEntry<TData, TRaw extends WebsiteExtractMeta> {
  data: TData;
  raw: TRaw;
  meta: WebsiteExtractMeta;
}

interface UseWebsiteExtractorBaseConfig<
  TResponse extends WebsiteExtractMeta,
  TData,
> {
  endpoint: string;
  options: WebsiteExtractorOptions;
  selectData: (
    payload: Omit<TResponse, keyof WebsiteExtractMeta>,
    raw: TResponse,
    meta: WebsiteExtractMeta
  ) => TData;
  shouldSkip?: (url: string) => boolean;
}

export function useWebsiteExtractorBase<
  TResponse extends WebsiteExtractMeta,
  TData,
>(config: UseWebsiteExtractorBaseConfig<TResponse, TData>): WebsiteExtractorResult<
  TData,
  TResponse
> {
  const { endpoint, options, selectData, shouldSkip } = config;
  const isClient = useIsClient();
  const [state, setState] = useState<WebsiteExtractorState<TData, TResponse>>({
    loading: false,
  });

  const [, cacheActions] = useMap<
    string,
    CachedExtractorEntry<TData, TResponse>
  >();
  const cacheEnabled = options.cache ?? DEFAULT_EXTRACTOR_CACHE;
  const enabled = options.enabled ?? DEFAULT_EXTRACTOR_ENABLED;
  const debounceMs = options.debounceMs ?? DEFAULT_EXTRACTOR_DEBOUNCE_MS;
  const refreshDebounceMs =
    options.refreshDebounceMs ?? DEFAULT_EXTRACTOR_REFRESH_DEBOUNCE_MS;

  const normalizedUrl = useMemo(() => {
    return options.url?.trim() ?? "";
  }, [options.url]);

  const debouncedUrl = useDebounceValue(normalizedUrl, debounceMs);

  const refreshCounterRef = useRef(0);
  const lastRefreshHandledRef = useRef(0);
  const [refreshToken, setRefreshToken] = useState(0);

  const { debouncedCallback: scheduleRefresh, cancel: cancelRefresh } =
    useDebounceCallback(() => {
      refreshCounterRef.current += 1;
      setRefreshToken(refreshCounterRef.current);
    }, refreshDebounceMs);

  const refresh = useCallback(() => {
    scheduleRefresh();
  }, [scheduleRefresh]);

  useEffect(() => () => cancelRefresh(), [cancelRefresh]);

  const requestKey = useMemo(() => {
    if (!debouncedUrl) {
      return "";
    }

    const baseUrl = options.baseUrl ?? DEFAULT_WEBSITE_EXTRACTOR_BASE_URL;
    const apiKey = options.apiKey ?? "";
    return `${endpoint}:${baseUrl}:${apiKey}:${debouncedUrl}`;
  }, [
    endpoint,
    options.apiKey,
    options.baseUrl,
    debouncedUrl,
  ]);

  const inFlightControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (!enabled || !debouncedUrl) {
      setState({ loading: false });
      return;
    }

    if (shouldSkip?.(debouncedUrl)) {
      setState({ loading: false });
      return;
    }

    const forceRefresh = refreshToken !== lastRefreshHandledRef.current;
    if (forceRefresh) {
      lastRefreshHandledRef.current = refreshToken;
    }

    if (cacheEnabled && !forceRefresh) {
      const cached = cacheActions.get(requestKey);
      if (cached) {
        setState({
          loading: false,
          data: cached.data,
          raw: cached.raw,
          meta: cached.meta,
        });
        return;
      }
    }

    inFlightControllerRef.current?.abort();
    const controller = new AbortController();
    inFlightControllerRef.current = controller;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: undefined,
    }));

    fetchWebsiteExtractor<TResponse>({
      endpoint,
      url: debouncedUrl,
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }

        if (!result.ok) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: result.error,
          }));
          return;
        }

        const raw = result.response;
        const meta = extractWebsiteMeta(raw);
        const payload = stripWebsiteMeta(raw);
        const data = selectData(payload, raw, meta);

        if (cacheEnabled) {
          cacheActions.set(requestKey, { data, raw, meta });
        }

        setState({
          loading: false,
          data,
          raw,
          meta,
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : "Request failed unexpectedly.",
            raw: error,
          },
        }));
      });

    return () => {
      controller.abort();
    };
  }, [
    cacheActions,
    cacheEnabled,
    debouncedUrl,
    enabled,
    endpoint,
    isClient,
    options.apiKey,
    options.baseUrl,
    requestKey,
    refreshToken,
    selectData,
    shouldSkip,
  ]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [refresh, state]
  );
}
