# useOpenGraphExtractor

Fetch and normalize Open Graph data from the Octane extract endpoint with built-in debouncing, caching, and fallbacks.

## Features

- Debounced URL fetching to avoid request storms
- In-memory result caching with manual refresh
- Fallback resolution across Open Graph, hybrid, and HTML-inferred data
- SSR-safe (no fetch on server render)
- Skips known problematic URL patterns by default

## Usage

```typescript
import { useOpenGraphExtractor } from "@opensite/hooks";

function OgPreview({ url, apiKey }: { url: string; apiKey?: string }) {
  const { data, loading, error, refresh } = useOpenGraphExtractor({
    url,
    apiKey,
    debounceMs: 250,
  });

  if (loading) return <span>Loading…</span>;
  if (error) return <span>{error.message}</span>;
  if (!data) return null;

  return (
    <article>
      <img src={data.image} alt={data.title ?? "Preview"} />
      <h3>{data.title}</h3>
      <p>{data.description}</p>
      <button onClick={refresh}>Refresh</button>
    </article>
  );
}
```

## API

### Parameters

- `url`: URL to extract Open Graph data from.
- `apiKey`: Optional API key for Octane.
- `baseUrl`: Optional base URL (default: `https://octane.buzz`).
- `debounceMs`: Debounce delay in ms (default: `250`).
- `refreshDebounceMs`: Debounce delay for manual refresh (default: `150`).
- `enabled`: Toggle fetch behavior (default: `true`).
- `cache`: Toggle in-memory cache (default: `true`).
- `skipPatterns`: Optional array of RegExp patterns to skip.

### Return Value

Returns an object:

- `data`: Normalized Open Graph summary with fallbacks.
- `raw`: Full Open Graph response from Octane (includes meta + graphs).
- `meta`: Response metadata (cache info, status, body sizes, etc).
- `error`: `{ message, status?, raw? }` when the request fails.
- `loading`: Loading state.
- `refresh`: Debounced re-fetch for the current URL.

## Types

```typescript
interface OpenGraphSummary {
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
```
