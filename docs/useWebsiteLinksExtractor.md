# useWebsiteLinksExtractor

Extract outbound and internal link data from a webpage using Octane’s links endpoint.

## Features

- Debounced URL fetching
- In-memory caching + refresh
- SSR-safe
- Stable link arrays with defaults

## Usage

```typescript
import { useWebsiteLinksExtractor } from "@opensite/hooks";

function LinkSummary({ url }: { url: string }) {
  const { data, loading } = useWebsiteLinksExtractor({ url });

  if (loading) return <span>Loading…</span>;
  if (!data) return null;

  return (
    <div>
      <strong>{data.totalLinks} links</strong>
      <p>{data.uniqueDomains} unique domains</p>
    </div>
  );
}
```

## API

### Parameters

- `url`: URL to extract links from.
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
interface WebsiteLinksPayload {
  totalLinks: number;
  uniqueDomains: number;
  links: WebsiteLinkRecord[];
}

interface WebsiteLinkRecord {
  url: string;
  text: string;
  isExternal: boolean;
  domain?: string | null;
}
```
