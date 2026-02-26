# useIsTouchDevice

Detect whether the device's primary input mechanism is touch-based, with real-time updates for hybrid/convertible devices.

## Features

- Layered detection: CSS Interaction Media Features + legacy touch-API probe
- Dynamic updates via `matchMedia` change events (convertible laptops, foldables)
- SSR-safe with configurable default value
- Imperative `recheck()` for on-demand re-evaluation
- Memoized return object for stable references
- TypeScript support with exported types
- Zero dependencies

## Usage

### Basic Example

```typescript
import { useIsTouchDevice } from '@opensite/hooks/useIsTouchDevice';

function InteractiveComponent() {
  const { isTouchDevice } = useIsTouchDevice();

  return (
    <div>
      {isTouchDevice ? (
        <p>Tap to interact</p>
      ) : (
        <p>Click to interact</p>
      )}
    </div>
  );
}
```

### Adaptive UI Controls

```typescript
import { useIsTouchDevice } from '@opensite/hooks/useIsTouchDevice';

function Toolbar() {
  const { isTouchDevice } = useIsTouchDevice();

  return (
    <nav>
      {isTouchDevice ? (
        <TouchToolbar iconSize={48} spacing="large" />
      ) : (
        <DesktopToolbar iconSize={24} spacing="compact" />
      )}
    </nav>
  );
}
```

### Drag-and-Drop Strategy

```typescript
import { useIsTouchDevice } from '@opensite/hooks/useIsTouchDevice';

function DraggableList({ items }) {
  const { isTouchDevice } = useIsTouchDevice();

  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.id}
          draggable={!isTouchDevice}
          onDragStart={!isTouchDevice ? handleDragStart : undefined}
          onTouchStart={isTouchDevice ? handleTouchStart : undefined}
          onTouchMove={isTouchDevice ? handleTouchMove : undefined}
          onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

### Tooltip Behavior

```typescript
import { useIsTouchDevice } from '@opensite/hooks/useIsTouchDevice';

function TooltipWrapper({ content, children }) {
  const { isTouchDevice } = useIsTouchDevice();

  if (isTouchDevice) {
    // Touch devices: show tooltip on long-press or tap
    return (
      <LongPressTooltip content={content}>
        {children}
      </LongPressTooltip>
    );
  }

  // Desktop: show tooltip on hover
  return (
    <HoverTooltip content={content}>
      {children}
    </HoverTooltip>
  );
}
```

### Granular Device Type Handling

```typescript
import { useIsTouchDevice } from '@opensite/hooks/useIsTouchDevice';

function ResponsiveInput() {
  const { deviceType } = useIsTouchDevice();

  switch (deviceType) {
    case 'unknown':
      // SSR or not yet detected — render a safe default
      return <input type="text" placeholder="Enter value..." />;
    case 'touch':
      return <input type="text" inputMode="numeric" placeholder="Tap to enter..." />;
    case 'desktop':
      return <input type="number" placeholder="Type a number..." />;
  }
}
```

### With Server-Side Hint (SSR Optimization)

```typescript
import { useIsTouchDevice, type DeviceType } from '@opensite/hooks/useIsTouchDevice';

// Server component or middleware determines device type from User-Agent
function Page({ ssrDeviceHint }: { ssrDeviceHint: DeviceType }) {
  const { isTouchDevice } = useIsTouchDevice({
    defaultDeviceType: ssrDeviceHint,
  });

  return (
    <div>
      {isTouchDevice ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
}
```

### Imperative Recheck

```typescript
import { useIsTouchDevice } from '@opensite/hooks/useIsTouchDevice';

function DeviceMonitor() {
  const { deviceType, recheck } = useIsTouchDevice();

  return (
    <div>
      <p>Current input mode: {deviceType}</p>
      <button onClick={recheck}>
        Re-detect input mode
      </button>
    </div>
  );
}
```

### Conditional Event Handling

```typescript
import { useIsTouchDevice } from '@opensite/hooks/useIsTouchDevice';

function ImageGallery({ images }) {
  const { isTouchDevice } = useIsTouchDevice();

  return (
    <div className="gallery">
      {images.map((img) => (
        <img
          key={img.id}
          src={img.src}
          alt={img.alt}
          // Swipe on touch, click-to-advance on desktop
          onTouchStart={isTouchDevice ? handleSwipeStart : undefined}
          onTouchMove={isTouchDevice ? handleSwipeMove : undefined}
          onClick={!isTouchDevice ? handleClickAdvance : undefined}
          style={{
            cursor: isTouchDevice ? 'default' : 'pointer',
          }}
        />
      ))}
    </div>
  );
}
```

## API

### Parameters

1. `options` (optional): Configuration object
   - `defaultDeviceType`: Value returned during SSR and before client detection. Accepts `"unknown"`, `"touch"`, or `"desktop"`. Defaults to `"unknown"`.

### Return Value

Returns a memoized `UseIsTouchDeviceResult` object:

| Property | Type | Description |
|----------|------|-------------|
| `deviceType` | `"unknown" \| "touch" \| "desktop"` | Granular classification of the primary input device |
| `isTouchDevice` | `boolean` | Convenience boolean — `true` when `deviceType === "touch"` |
| `recheck` | `() => void` | Stable callback to imperatively re-run detection |

## TypeScript

```typescript
type DeviceType = "unknown" | "touch" | "desktop";

interface UseIsTouchDeviceOptions {
  defaultDeviceType?: DeviceType;
}

interface UseIsTouchDeviceResult {
  deviceType: DeviceType;
  isTouchDevice: boolean;
  recheck: () => void;
}

function useIsTouchDevice(
  options?: UseIsTouchDeviceOptions
): UseIsTouchDeviceResult;
```

## Detection Strategy

The hook uses a two-tier detection approach:

1. **CSS Interaction Media Features (Tier 1)** — Queries `(hover: none) and (pointer: coarse)` via `matchMedia`. This is the W3C-standard way to detect touch-primary devices and correctly handles hybrid hardware by inspecting only the *primary* input. Supported in Chrome 41+, Firefox 64+, Safari 9+.

2. **Legacy touch-API probe (Tier 2)** — Falls back to checking `ontouchstart in window` and `navigator.maxTouchPoints > 0`. Only reached when the browser does not support Interaction Media Features. This fallback can produce false positives on some desktop touchscreens but covers older Android WebView and pre-Chromium Edge.

The hook subscribes to `matchMedia` change events, so convertible devices (e.g. Surface Pro, iPad with Magic Keyboard) automatically update when the user switches between touch and pointer input modes.

## SSR Considerations

The hook returns `"unknown"` (or the provided `defaultDeviceType`) on the server and during the first client render. This ensures identical markup between server and client, preventing hydration mismatches.

For the best user experience when SSR is involved:
- Use `"unknown"` (default) and render a UI that works with both input types
- Or pass a server-derived hint via `defaultDeviceType` based on User-Agent analysis to minimize layout shift after hydration

## Use Cases

- Adaptive touch targets (larger tap areas on touch devices)
- Input mode switching (hover tooltips vs. long-press tooltips)
- Drag-and-drop strategy selection (pointer events vs. touch events)
- Conditional scroll behavior (momentum scrolling, pull-to-refresh)
- Form input optimization (`inputMode`, virtual keyboard hints)
- Analytics and device segmentation
- Convertible/hybrid device support (real-time mode switching)
