# useIsomorphicLayoutEffect

A hook that uses `useLayoutEffect` on the client and `useEffect` on the server for SSR compatibility.

## Features

- SSR-safe layout effects
- Automatic environment detection
- Prevents SSR warnings
- Drop-in replacement for `useLayoutEffect`
- TypeScript support

## Usage

### Basic Example

```typescript
import { useIsomorphicLayoutEffect } from '@opensite-ai/react-hooks';

function Component() {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    // This runs synchronously after DOM mutations on client
    // and as a regular effect on server
    if (ref.current) {
      const height = ref.current.offsetHeight;
      console.log('Element height:', height);
    }
  }, []);

  return <div ref={ref}>Content</div>;
}
```

### DOM Measurement Example

```typescript
import { useState, useRef } from 'react';
import { useIsomorphicLayoutEffect } from '@opensite-ai/react-hooks';

function ResponsiveComponent() {
  const [width, setWidth] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (elementRef.current) {
      setWidth(elementRef.current.offsetWidth);
    }
  }, []);

  return (
    <div ref={elementRef}>
      Element width: {width}px
    </div>
  );
}
```

### Scroll Position Example

```typescript
import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from '@opensite-ai/react-hooks';

function ScrollToTop() {
  useIsomorphicLayoutEffect(() => {
    // Scroll to top before paint
    window.scrollTo(0, 0);
  }, []);

  return <div>Page content</div>;
}
```

### Animation Setup Example

```typescript
import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from '@opensite-ai/react-hooks';

function AnimatedComponent() {
  const elementRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (elementRef.current) {
      // Set initial animation state before paint
      elementRef.current.style.opacity = '0';
      elementRef.current.style.transform = 'translateY(20px)';

      // Trigger animation
      requestAnimationFrame(() => {
        if (elementRef.current) {
          elementRef.current.style.transition = 'all 0.3s';
          elementRef.current.style.opacity = '1';
          elementRef.current.style.transform = 'translateY(0)';
        }
      });
    }
  }, []);

  return <div ref={elementRef}>Animated content</div>;
}
```

## API

### Parameters

Same as `useLayoutEffect` / `useEffect`:
1. `effect`: Function that contains imperative, possibly effectful code
2. `deps`: Dependency array

### Return Value

This hook does not return a value.

## TypeScript

```typescript
const useIsomorphicLayoutEffect: typeof useLayoutEffect;
```

## How It Works

```typescript
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
```

- **Client-side**: Uses `useLayoutEffect` for synchronous execution after DOM mutations
- **Server-side**: Uses `useEffect` to avoid SSR warnings

## Use Cases

- DOM measurements before paint
- Scroll position management
- Animation setup
- Synchronous DOM updates
- Layout calculations
- Third-party library integration

## When to Use

Use `useIsomorphicLayoutEffect` instead of `useLayoutEffect` when:
- Your app uses SSR (Next.js, Gatsby, etc.)
- You need to measure or manipulate the DOM before paint
- You want to avoid "useLayoutEffect does nothing on the server" warnings

## Performance Notes

- On the client, this runs synchronously after DOM mutations but before paint
- This can block visual updates, so use sparingly
- For non-critical updates, prefer `useEffect`

