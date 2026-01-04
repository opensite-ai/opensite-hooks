# useWebsiteMetaExtractor

Extract title/description/meta tags and canonical info from a webpage.

## Features

- Debounced URL fetching
- In-memory caching with refresh
- SSR-safe
- Normalized meta tag record output

## Usage

```typescript
import { useWebsiteMetaExtractor } from "@opensite/hooks";

function MetaCard({ url }: { url: string }) {
  const { data, loading, error } = useWebsiteMetaExtractor({ url });

  if (loading) return <span>Loading…</span>;
  if (error) return <span>{error.message}</span>;
  if (!data) return null;

  return (
    <div>
      <h4>{data.title}</h4>
      <p>{data.description}</p>
    </div>
  );
}
```

## API

### Parameters

- `url`: URL to extract meta data from.
- `apiKey`: Optional API key for Octane.
- `baseUrl`: Optional base URL (default: `https://octane.buzz`).
- `debounceMs`: Debounce delay in ms (default: `250`).
- `refreshDebounceMs`: Debounce delay for manual refresh (default: `150`).
- `enabled`: Toggle fetch behavior (default: `true`).
- `cache`: Toggle in-memory cache (default: `true`).

### Return Value

Returns an object with `data`, `raw`, `meta`, `error`, `loading`, and `refresh`.

## Types

```typescript
interface WebsiteMetaPayload {
  title?: string | null;
  description?: string | null;
  language?: string | null;
  canonicalUrl?: string | null;
  feedUrl?: string | null;
  textContentLength?: number | null;
  metaTags: Record<string, string>;
}
```
