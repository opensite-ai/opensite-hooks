# useWebsiteSchemaExtractor

Extract Schema.org data from a website using Octane’s schema endpoint.

## Features

- Debounced URL fetching
- In-memory caching with manual refresh
- SSR-safe behavior
- Consistent schema arrays (empty arrays when missing)

## Usage

```typescript
import { useWebsiteSchemaExtractor } from "@opensite/hooks";

function SchemaList({ url }: { url: string }) {
  const { data, loading, error } = useWebsiteSchemaExtractor({ url });

  if (loading) return <span>Loading…</span>;
  if (error) return <span>{error.message}</span>;
  if (!data?.schema.length) return <span>No schema found.</span>;

  return (
    <ul>
      {data.schema.map((item, index) => (
        <li key={index}>{item.schema_type}</li>
      ))}
    </ul>
  );
}
```

## API

### Parameters

- `url`: URL to extract Schema.org data from.
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
interface WebsiteSchemaPayload {
  schema: WebsiteSchemaRecord[];
  schemaTypes: string[];
}

interface WebsiteSchemaRecord {
  schema_type: string;
  value: Record<string, unknown>;
}
```
