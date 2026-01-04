# useIsClient

A hook for detecting if code is running on the client-side (browser) or server-side (SSR).

## Features

- Simple client-side detection
- SSR-safe
- Useful for conditional rendering
- Prevents hydration mismatches
- TypeScript support

## Usage

### Basic Example

```typescript
import { useIsClient } from '@opensite/hooks';

function ClientOnlyComponent() {
  const isClient = useIsClient();

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return <div>Client-side content: {window.location.href}</div>;
}
```

### Browser API Example

```typescript
import { useIsClient } from '@opensite/hooks';

function GeolocationComponent() {
  const isClient = useIsClient();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (isClient && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, [isClient]);

  if (!isClient) {
    return null;
  }

  return <div>Your location: {JSON.stringify(location)}</div>;
}
```

### Local Storage Example

```typescript
import { useIsClient } from '@opensite/hooks';

function UserPreferences() {
  const isClient = useIsClient();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (isClient) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, [isClient]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (isClient) {
      localStorage.setItem('theme', newTheme);
    }
  };

  return (
    <div>
      <button onClick={() => handleThemeChange('light')}>Light</button>
      <button onClick={() => handleThemeChange('dark')}>Dark</button>
    </div>
  );
}
```

### Conditional Script Loading

```typescript
import { useIsClient } from '@opensite/hooks';

function AnalyticsComponent() {
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      // Load analytics script only on client
      const script = document.createElement('script');
      script.src = 'https://analytics.example.com/script.js';
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isClient]);

  return null;
}
```

## API

### Parameters

This hook takes no parameters.

### Return Value

Returns a boolean:
- `true`: Code is running in the browser (client-side)
- `false`: Code is running on the server (SSR) or during initial render

## TypeScript

```typescript
function useIsClient(): boolean;
```

## How It Works

The hook returns `false` initially and sets it to `true` in a `useEffect`, which only runs on the client-side. This ensures:
1. Server-side rendering gets consistent `false` value
2. Client-side hydration matches the server render
3. After hydration, the value updates to `true`

## Use Cases

- Accessing browser-only APIs (window, document, localStorage, etc.)
- Preventing hydration mismatches in SSR applications
- Conditional rendering of client-only components
- Loading third-party scripts only on the client
- Geolocation and other browser features
- Analytics and tracking initialization

## SSR Considerations

This hook is essential for Next.js, Gatsby, and other SSR frameworks to avoid errors when accessing browser-only APIs during server-side rendering.

