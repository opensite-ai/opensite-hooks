# useMediaQuery

A hook for responsive design using CSS media queries with automatic updates.

## Features

- Real-time media query matching
- SSR-safe with default values
- Automatic cleanup
- TypeScript support
- Works with any valid CSS media query

## Usage

### Basic Example

```typescript
import { useMediaQuery } from '@opensite/hooks';

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
    </div>
  );
}
```

### Multiple Breakpoints Example

```typescript
import { useMediaQuery } from '@opensite/hooks';

function AdaptiveLayout() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  return (
    <div>
      {isMobile && <p>Mobile View</p>}
      {isTablet && <p>Tablet View</p>}
      {isDesktop && <p>Desktop View</p>}
    </div>
  );
}
```

### Dark Mode Example

```typescript
import { useMediaQuery } from '@opensite/hooks';

function ThemeProvider({ children }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <div className={prefersDark ? 'dark-theme' : 'light-theme'}>
      {children}
    </div>
  );
}
```

### Orientation Example

```typescript
import { useMediaQuery } from '@opensite/hooks';

function OrientationAware() {
  const isPortrait = useMediaQuery('(orientation: portrait)');

  return (
    <div>
      {isPortrait ? (
        <p>Please rotate your device to landscape</p>
      ) : (
        <VideoPlayer />
      )}
    </div>
  );
}
```

### Print Styles Example

```typescript
import { useMediaQuery } from '@opensite/hooks';

function PrintableDocument() {
  const isPrint = useMediaQuery('print');

  return (
    <div>
      {!isPrint && <Navigation />}
      <Content />
      {!isPrint && <Footer />}
    </div>
  );
}
```

### High DPI Detection Example

```typescript
import { useMediaQuery } from '@opensite/hooks';

function ImageComponent({ src, retinaScr }) {
  const isRetina = useMediaQuery('(min-resolution: 2dppx)');

  return (
    <img src={isRetina ? retinaScr : src} alt="Responsive image" />
  );
}
```

### With Default Value (SSR)

```typescript
import { useMediaQuery } from '@opensite/hooks';

function SSRComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)', {
    defaultValue: false // Assume desktop during SSR
  });

  return (
    <div>
      {isMobile ? 'Mobile' : 'Desktop'}
    </div>
  );
}
```

### Reduced Motion Example

```typescript
import { useMediaQuery } from '@opensite/hooks';

function AnimatedComponent() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div
      style={{
        transition: prefersReducedMotion ? 'none' : 'all 0.3s ease'
      }}
    >
      Animated content
    </div>
  );
}
```

## API

### Parameters

1. `query`: CSS media query string
2. `options` (optional): Configuration object
   - `defaultValue`: Value to return during SSR or when `matchMedia` is unavailable. Defaults to `false`.

### Return Value

Returns a boolean indicating whether the media query matches.

## TypeScript

```typescript
interface UseMediaQueryOptions {
  defaultValue?: boolean;
}

function useMediaQuery(
  query: string,
  options?: UseMediaQueryOptions
): boolean;
```

## Common Media Queries

```typescript
// Breakpoints
const isMobile = useMediaQuery('(max-width: 640px)');
const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
const isDesktop = useMediaQuery('(min-width: 1025px)');

// User preferences
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

// Device features
const isRetina = useMediaQuery('(min-resolution: 2dppx)');
const isPortrait = useMediaQuery('(orientation: portrait)');
const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
```

## Use Cases

- Responsive layouts
- Dark mode detection
- Device orientation handling
- Print styles
- Accessibility preferences
- High DPI image loading
- Conditional feature rendering

