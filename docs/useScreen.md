# useScreen

Track viewport dimensions and compute Tailwind CSS breakpoint / semantic screen type for responsive layout decisions.

## Features

- Real-time viewport width and height tracking
- Tailwind CSS v4 breakpoint detection (`default`, `sm`, `md`, `lg`, `xl`, `2xl`)
- Semantic screen type classification (`MOBILE`, `TABLET`, `DESKTOP`)
- Custom breakpoint configuration
- Custom screen type mapping
- SSR-safe with configurable defaults
- Memoized return object for stable references
- Built on `useMediaQuery` for efficient breakpoint detection
- TypeScript support with exported types

## Usage

### Basic Example

```typescript
import { useScreen } from '@opensite/hooks/useScreen';

function ResponsiveLayout() {
  const { screenType, tailwindSize, width, height } = useScreen();

  return (
    <div>
      <p>Viewport: {width}x{height}px</p>
      <p>Tailwind breakpoint: {tailwindSize}</p>
      {screenType === "MOBILE" && <MobileLayout />}
      {screenType === "TABLET" && <TabletLayout />}
      {screenType === "DESKTOP" && <DesktopLayout />}
    </div>
  );
}
```

### Conditional Rendering by Screen Type

```typescript
import { useScreen } from '@opensite/hooks/useScreen';

function Navigation() {
  const { screenType } = useScreen();

  switch (screenType) {
    case "MOBILE":
      return <HamburgerMenu />;
    case "TABLET":
      return <CollapsibleSidebar />;
    case "DESKTOP":
      return <FullNavigation />;
    default:
      return <HamburgerMenu />; // Safe default for SSR
  }
}
```

### Using Tailwind Size for Granular Control

```typescript
import { useScreen } from '@opensite/hooks/useScreen';

function GridLayout({ items }) {
  const { tailwindSize } = useScreen();

  // Determine columns based on exact Tailwind breakpoint
  const columns = {
    default: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    "2xl": 5,
  }[tailwindSize];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {items.map(item => <Card key={item.id} {...item} />)}
    </div>
  );
}
```

### Custom Breakpoints

```typescript
import { useScreen } from '@opensite/hooks/useScreen';

function CustomBreakpointLayout() {
  const { screenType, tailwindSize } = useScreen({
    breakpoints: {
      sm: 600,   // Custom: 600px instead of 640px
      md: 900,   // Custom: 900px instead of 768px
      lg: 1200,  // Custom: 1200px instead of 1024px
      xl: 1400,  // Custom: 1400px instead of 1280px
      "2xl": 1800, // Custom: 1800px instead of 1536px
    },
  });

  return (
    <div>
      <p>Current breakpoint: {tailwindSize}</p>
      <p>Screen type: {screenType}</p>
    </div>
  );
}
```

### Custom Screen Type Mapping

```typescript
import { useScreen } from '@opensite/hooks/useScreen';

function CustomMappingLayout() {
  const { screenType } = useScreen({
    screenTypeMapping: {
      default: "MOBILE",
      sm: "MOBILE",
      md: "MOBILE",    // Treat md as MOBILE instead of TABLET
      lg: "TABLET",    // Treat lg as TABLET instead of DESKTOP
      xl: "DESKTOP",
      "2xl": "DESKTOP",
    },
  });

  return <div>Screen type: {screenType}</div>;
}
```

### SSR with Default Values

```typescript
import { useScreen } from '@opensite/hooks/useScreen';

function SSRSafeLayout() {
  const { screenType, tailwindSize } = useScreen({
    defaultScreenType: "DESKTOP",    // Assume desktop during SSR
    defaultTailwindSize: "lg",       // Assume lg breakpoint during SSR
  });

  return (
    <div>
      {/* Safe to render - won't cause hydration mismatch */}
      {screenType === "DESKTOP" ? <DesktopView /> : <MobileView />}
    </div>
  );
}
```

### Responsive Images

```typescript
import { useScreen } from '@opensite/hooks/useScreen';

function ResponsiveImage({ src, alt }) {
  const { tailwindSize, width } = useScreen();

  // Select image size based on breakpoint
  const imageSizes = {
    default: 'small',
    sm: 'small',
    md: 'medium',
    lg: 'large',
    xl: 'large',
    "2xl": 'xlarge',
  };

  const imageSize = imageSizes[tailwindSize];

  return (
    <img
      src={`${src}?size=${imageSize}`}
      alt={alt}
      width={width}
    />
  );
}
```

### Imperative Refresh

```typescript
import { useScreen } from '@opensite/hooks/useScreen';

function FullscreenToggle() {
  const { width, height, refresh } = useScreen();

  const handleFullscreenChange = () => {
    // After fullscreen toggle, manually refresh dimensions
    refresh();
  };

  return (
    <div>
      <p>Dimensions: {width}x{height}</p>
      <button onClick={() => {
        document.documentElement.requestFullscreen();
        // Refresh after a short delay for fullscreen to complete
        setTimeout(handleFullscreenChange, 100);
      }}>
        Toggle Fullscreen
      </button>
    </div>
  );
}
```

### Analytics and Logging

```typescript
import { useScreen } from '@opensite/hooks/useScreen';
import { useEffect } from 'react';

function AnalyticsTracker() {
  const { screenType, tailwindSize, width, height } = useScreen();

  useEffect(() => {
    // Log viewport info for analytics
    analytics.track('viewport_info', {
      screenType,
      tailwindSize,
      width,
      height,
    });
  }, [screenType, tailwindSize, width, height]);

  return null;
}
```

## API

### Parameters

1. `options` (optional): Configuration object
   - `breakpoints`: Custom breakpoint pixel thresholds (partial, merges with defaults)
   - `screenTypeMapping`: Custom mapping of breakpoints to screen types (partial, merges with defaults)
   - `defaultScreenType`: Value returned during SSR. Defaults to `"UNKNOWN"`
   - `defaultTailwindSize`: Tailwind size returned during SSR. Defaults to `"default"`

### Return Value

Returns a memoized `UseScreenResult` object:

| Property | Type | Description |
|----------|------|-------------|
| `width` | `number` | Current viewport width in pixels. `0` during SSR |
| `height` | `number` | Current viewport height in pixels. `0` during SSR |
| `tailwindSize` | `TailwindSize` | Current Tailwind CSS breakpoint (`"default"` \| `"sm"` \| `"md"` \| `"lg"` \| `"xl"` \| `"2xl"`) |
| `screenType` | `ScreenType` | Semantic classification (`"UNKNOWN"` \| `"MOBILE"` \| `"TABLET"` \| `"DESKTOP"`) |
| `refresh` | `() => void` | Stable callback to re-measure viewport dimensions |

## TypeScript

```typescript
type TailwindSize = "default" | "sm" | "md" | "lg" | "xl" | "2xl";

type ScreenType = "UNKNOWN" | "MOBILE" | "TABLET" | "DESKTOP";

interface ScreenBreakpoints {
  sm: number;   // Default: 640
  md: number;   // Default: 768
  lg: number;   // Default: 1024
  xl: number;   // Default: 1280
  "2xl": number; // Default: 1536
}

interface ScreenTypeMapping {
  default: ScreenType; // Default: "MOBILE"
  sm: ScreenType;      // Default: "MOBILE"
  md: ScreenType;      // Default: "TABLET"
  lg: ScreenType;      // Default: "DESKTOP"
  xl: ScreenType;      // Default: "DESKTOP"
  "2xl": ScreenType;   // Default: "DESKTOP"
}

interface UseScreenOptions {
  breakpoints?: Partial<ScreenBreakpoints>;
  screenTypeMapping?: Partial<ScreenTypeMapping>;
  defaultScreenType?: ScreenType;
  defaultTailwindSize?: TailwindSize;
}

interface UseScreenResult {
  width: number;
  height: number;
  tailwindSize: TailwindSize;
  screenType: ScreenType;
  refresh: () => void;
}

function useScreen(options?: UseScreenOptions): UseScreenResult;
```

## Default Breakpoints (Tailwind CSS v4)

| Breakpoint | Min Width | Screen Type |
|------------|-----------|-------------|
| `default`  | 0px       | MOBILE      |
| `sm`       | 640px     | MOBILE      |
| `md`       | 768px     | TABLET      |
| `lg`       | 1024px    | DESKTOP     |
| `xl`       | 1280px    | DESKTOP     |
| `2xl`      | 1536px    | DESKTOP     |

## How It Works

1. **Media Query Detection**: Uses `useMediaQuery` internally to detect which Tailwind breakpoints are active. This is more reliable than checking `window.innerWidth` alone and provides instant updates via `matchMedia` change events.

2. **Dimension Tracking**: Subscribes to window `resize` events to track actual viewport width and height.

3. **Mobile-First Logic**: Determines `tailwindSize` by finding the largest active breakpoint. If multiple breakpoints match (e.g., at 1024px both `sm`, `md`, and `lg` match), the largest (`lg`) wins.

4. **Screen Type Mapping**: Maps the detected `tailwindSize` to a semantic `screenType` using the configurable mapping.

## SSR Considerations

The hook returns safe defaults during SSR:
- `width: 0`
- `height: 0`
- `tailwindSize: "default"` (or custom `defaultTailwindSize`)
- `screenType: "UNKNOWN"` (or custom `defaultScreenType`)

After hydration, values update to reflect the actual viewport. To minimize layout shift, provide `defaultScreenType` and `defaultTailwindSize` based on server-side User-Agent detection.

## Performance

- Uses CSS media queries via `useMediaQuery` for breakpoint detection (no polling)
- Viewport dimensions update on `resize` events (native browser events)
- Return object is memoized; reference only changes when values change
- `refresh` callback is stable across the hook's lifetime

## Use Cases

- Responsive navigation (hamburger vs. full nav)
- Grid column layouts based on viewport
- Conditional component rendering
- Image size selection
- Analytics and device tracking
- Adaptive UI density
- Touch-friendly target sizing
