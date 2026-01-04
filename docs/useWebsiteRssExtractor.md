# useWebsiteRssExtractor

Extract RSS feed information from a website. This is a specialized endpoint primarily for podcast/news-style sites.

## Features

- Debounced URL fetching
- In-memory caching with refresh
- SSR-safe
- Stable feed arrays (defaults to empty list)

## Usage

```typescript
import { useWebsiteRssExtractor } from "@opensite/hooks";

function FeedBadge({ url }: { url: string }) {
  const { data } = useWebsiteRssExtractor({ url });

  if (!data?.feeds.length) return null;
  return <span>{data.feeds[0].title ?? "RSS Feed"}</span>;
}
```

## Important Notes

- This endpoint often returns an empty `feeds` array for non-feed sites.
- Use it selectively for news, blog, and podcast URLs.

## API

### Parameters

- `url`: URL to extract RSS data from.
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
interface WebsiteRssPayload {
  feedUrl?: string | null;
  feeds: WebsiteRssFeed[];
}

interface WebsiteRssFeed {
  url: string;
  feedType: string;
  title?: string | null;
}
```
