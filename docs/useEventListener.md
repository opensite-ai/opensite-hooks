# useEventListener

A hook for attaching event listeners to DOM elements, window, or document with automatic cleanup.

## Features

- Type-safe event handling
- Supports Window, Document, and HTMLElement targets
- Supports ref objects
- Automatic cleanup on unmount
- SSR-safe
- TypeScript support with full type inference

## Usage

### Window Event Example

```typescript
import { useEventListener } from '@opensite/hooks';

function WindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEventListener('resize', () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  });

  return <div>Window size: {size.width} x {size.height}</div>;
}
```

### Element Ref Example

```typescript
import { useRef } from 'react';
import { useEventListener } from '@opensite/hooks';

function ClickableBox() {
  const boxRef = useRef<HTMLDivElement>(null);

  useEventListener('click', (event) => {
    console.log('Box clicked!', event);
  }, boxRef);

  return <div ref={boxRef}>Click me!</div>;
}
```

### Document Event Example

```typescript
import { useEventListener } from '@opensite/hooks';

function KeyboardShortcuts() {
  useEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      console.log('Save shortcut triggered');
    }
  }, document);

  return <div>Press Ctrl+S to save</div>;
}
```

### With Event Options

```typescript
import { useRef } from 'react';
import { useEventListener } from '@opensite/hooks';

function ScrollableList() {
  const listRef = useRef<HTMLDivElement>(null);

  useEventListener(
    'scroll',
    (event) => {
      console.log('Scrolled!', event);
    },
    listRef,
    { passive: true } // Performance optimization
  );

  return (
    <div ref={listRef} style={{ overflow: 'auto', height: '300px' }}>
      {/* List items */}
    </div>
  );
}
```

### Multiple Listeners Example

```typescript
import { useRef } from 'react';
import { useEventListener } from '@opensite/hooks';

function InteractiveElement() {
  const elementRef = useRef<HTMLDivElement>(null);

  useEventListener('mouseenter', () => {
    console.log('Mouse entered');
  }, elementRef);

  useEventListener('mouseleave', () => {
    console.log('Mouse left');
  }, elementRef);

  useEventListener('click', () => {
    console.log('Clicked');
  }, elementRef);

  return <div ref={elementRef}>Hover and click me</div>;
}
```

## API

### Parameters

1. `eventName`: Name of the event to listen for
2. `handler`: Event handler function
3. `element` (optional): Target element (Window, Document, HTMLElement, or ref). Defaults to `window`.
4. `options` (optional): AddEventListenerOptions or boolean for capture phase

### Return Value

This hook does not return a value.

## TypeScript

The hook is fully typed and provides type inference for event handlers based on the event name and target:

```typescript
// Window events
useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window,
  options?: AddEventListenerOptions | boolean
): void;

// Document events
useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: Document,
  options?: AddEventListenerOptions | boolean
): void;

// HTMLElement events
useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: React.RefObject<HTMLElement> | HTMLElement,
  options?: AddEventListenerOptions | boolean
): void;
```

## Use Cases

- Window resize handlers
- Keyboard shortcuts
- Scroll listeners
- Click outside detection
- Mouse tracking
- Custom element interactions

