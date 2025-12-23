# useHover

A hook for detecting hover state on elements using pointer events.

## Features

- Simple hover state detection
- Uses modern pointer events
- Works with touch devices
- Automatic cleanup
- TypeScript support with generic element types

## Usage

### Basic Example

```typescript
import { useRef } from 'react';
import { useHover } from '@opensite-ai/react-hooks';

function HoverCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const isHovered = useHover(cardRef);

  return (
    <div
      ref={cardRef}
      style={{
        padding: '20px',
        backgroundColor: isHovered ? 'lightblue' : 'white',
        transition: 'background-color 0.3s'
      }}
    >
      {isHovered ? 'Hovering!' : 'Hover over me'}
    </div>
  );
}
```

### Tooltip Example

```typescript
import { useRef } from 'react';
import { useHover } from '@opensite-ai/react-hooks';

function TooltipButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isHovered = useHover(buttonRef);

  return (
    <div style={{ position: 'relative' }}>
      <button ref={buttonRef}>Hover for info</button>
      {isHovered && (
        <div className="tooltip">
          This is helpful information!
        </div>
      )}
    </div>
  );
}
```

### Image Preview Example

```typescript
import { useRef } from 'react';
import { useHover } from '@opensite-ai/react-hooks';

function ImageThumbnail({ src, previewSrc }: { src: string; previewSrc: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const isHovered = useHover(imgRef);

  return (
    <div style={{ position: 'relative' }}>
      <img
        ref={imgRef}
        src={src}
        alt="Thumbnail"
        style={{ width: '100px', height: '100px' }}
      />
      {isHovered && (
        <img
          src={previewSrc}
          alt="Preview"
          style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            top: 0,
            left: '110px',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
}
```

### Conditional Rendering Example

```typescript
import { useRef } from 'react';
import { useHover } from '@opensite-ai/react-hooks';

function ActionCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const isHovered = useHover(cardRef);

  return (
    <div ref={cardRef} className="card">
      <h3>Card Title</h3>
      <p>Card content goes here</p>
      {isHovered && (
        <div className="actions">
          <button>Edit</button>
          <button>Delete</button>
          <button>Share</button>
        </div>
      )}
    </div>
  );
}
```

## API

### Parameters

- `ref`: React ref object pointing to the target HTML element

### Return Value

Returns a boolean indicating whether the element is currently being hovered.

## TypeScript

```typescript
function useHover<T extends HTMLElement>(
  ref: React.RefObject<T>
): boolean;
```

## Notes

- Uses `pointerenter` and `pointerleave` events for better cross-device support
- Works with touch devices that support pointer events
- Automatically cleans up event listeners on unmount
- The ref must be attached to a DOM element for the hook to work

## Use Cases

- Tooltips
- Hover cards
- Image previews
- Conditional action buttons
- Interactive UI elements
- Accessibility enhancements

