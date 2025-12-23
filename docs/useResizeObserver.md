# useResizeObserver

A hook for observing element size changes using the ResizeObserver API.

## Features

- Real-time element size tracking
- Callback or state-based API
- Supports refs and direct elements
- TypeScript support with generic element types
- Automatic cleanup
- SSR-safe

## Usage

### Basic Example

```typescript
import { useRef } from 'react';
import { useResizeObserver } from '@opensite-ai/react-hooks';

function ResizableBox() {
  const boxRef = useRef<HTMLDivElement>(null);
  const entry = useResizeObserver(boxRef);

  return (
    <div>
      <div
        ref={boxRef}
        style={{ resize: 'both', overflow: 'auto', border: '1px solid' }}
      >
        Resize me!
      </div>
      {entry && (
        <p>
          Size: {Math.round(entry.contentRect.width)} x{' '}
          {Math.round(entry.contentRect.height)}
        </p>
      )}
    </div>
  );
}
```

### Callback Example

```typescript
import { useRef } from 'react';
import { useResizeObserver } from '@opensite-ai/react-hooks';

function ResponsiveComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useResizeObserver(containerRef, (entry) => {
    const width = entry.contentRect.width;
    console.log('Container width:', width);

    if (width < 600) {
      console.log('Mobile layout');
    } else if (width < 1024) {
      console.log('Tablet layout');
    } else {
      console.log('Desktop layout');
    }
  });

  return (
    <div ref={containerRef}>
      Responsive content
    </div>
  );
}
```

### Chart Resize Example

```typescript
import { useRef, useEffect } from 'react';
import { useResizeObserver } from '@opensite-ai/react-hooks';

function Chart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  useResizeObserver(chartRef, (entry) => {
    if (chartInstance.current) {
      chartInstance.current.resize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    }
  });

  useEffect(() => {
    // Initialize chart
    chartInstance.current = createChart(chartRef.current);
    return () => chartInstance.current?.destroy();
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
}
```

### Responsive Text Example

```typescript
import { useRef, useState } from 'react';
import { useResizeObserver } from '@opensite-ai/react-hooks';

function ResponsiveText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(16);

  useResizeObserver(containerRef, (entry) => {
    const width = entry.contentRect.width;
    // Scale font size based on container width
    const newSize = Math.max(12, Math.min(24, width / 20));
    setFontSize(newSize);
  });

  return (
    <div ref={containerRef} style={{ fontSize: `${fontSize}px` }}>
      This text scales with container size
    </div>
  );
}
```

### Grid Layout Example

```typescript
import { useRef, useState } from 'react';
import { useResizeObserver } from '@opensite-ai/react-hooks';

function ResponsiveGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);

  useResizeObserver(gridRef, (entry) => {
    const width = entry.contentRect.width;
    if (width < 600) {
      setColumns(1);
    } else if (width < 900) {
      setColumns(2);
    } else {
      setColumns(3);
    }
  });

  return (
    <div
      ref={gridRef}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '1rem'
      }}
    >
      {items.map(item => (
        <div key={item.id}>{item.content}</div>
      ))}
    </div>
  );
}
```

### With Options Example

```typescript
import { useRef } from 'react';
import { useResizeObserver } from '@opensite-ai/react-hooks';

function BorderBoxObserver() {
  const elementRef = useRef<HTMLDivElement>(null);

  useResizeObserver(
    elementRef,
    (entry) => {
      console.log('Border box size:', entry.borderBoxSize);
    },
    { box: 'border-box' }
  );

  return <div ref={elementRef}>Content</div>;
}
```

## API

### Parameters

1. `target`: Element ref or direct element to observe
2. `onResize` (optional): Callback function called on resize
3. `options` (optional): ResizeObserverOptions
   - `box`: Box model to observe (`'content-box'`, `'border-box'`, `'device-pixel-content-box'`)

### Return Value

Returns `ResizeObserverEntry | null`:
- When using callback: Returns the latest entry (or `null`)
- When not using callback: Returns reactive state that updates on resize

## TypeScript

```typescript
function useResizeObserver<T extends Element>(
  target: React.RefObject<T> | T | null,
  onResize?: (entry: ResizeObserverEntry) => void,
  options?: ResizeObserverOptions
): ResizeObserverEntry | null;
```

## Use Cases

- Responsive components
- Chart resizing
- Dynamic layouts
- Text scaling
- Container queries
- Canvas resizing
- Virtualized lists

