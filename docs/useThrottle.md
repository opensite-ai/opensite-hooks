# useThrottle

A hook for throttling value changes with configurable leading and trailing edge execution.

## Features

- Throttle any value changes
- Leading and trailing edge options
- Configurable interval
- Automatic cleanup
- TypeScript support with generic types

## Usage

### Basic Example

```typescript
import { useState } from 'react';
import { useThrottle } from '@opensite-ai/react-hooks';

function ScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 200);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div>Scroll position: {throttledScrollY}px</div>;
}
```

### Search Input Example

```typescript
import { useState, useEffect } from 'react';
import { useThrottle } from '@opensite-ai/react-hooks';

function SearchWithThrottle() {
  const [searchTerm, setSearchTerm] = useState('');
  const throttledSearch = useThrottle(searchTerm, 500);

  useEffect(() => {
    if (throttledSearch) {
      // API call is throttled
      fetchSearchResults(throttledSearch);
    }
  }, [throttledSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Window Resize Example

```typescript
import { useState, useEffect } from 'react';
import { useThrottle } from '@opensite-ai/react-hooks';

function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const throttledSize = useThrottle(size, 300);

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      Window: {throttledSize.width} x {throttledSize.height}
    </div>
  );
}
```

### Mouse Position Example

```typescript
import { useState, useEffect } from 'react';
import { useThrottle } from '@opensite-ai/react-hooks';

function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const throttledPosition = useThrottle(position, 100);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div>
      Mouse: ({throttledPosition.x}, {throttledPosition.y})
    </div>
  );
}
```

### With Leading Edge Example

```typescript
import { useState } from 'react';
import { useThrottle } from '@opensite-ai/react-hooks';

function ButtonClicks() {
  const [clicks, setClicks] = useState(0);
  const throttledClicks = useThrottle(clicks, 1000, {
    leading: true,
    trailing: false
  });

  return (
    <div>
      <button onClick={() => setClicks(c => c + 1)}>
        Click me (throttled)
      </button>
      <p>Throttled clicks: {throttledClicks}</p>
    </div>
  );
}
```

### With Trailing Edge Example

```typescript
import { useState } from 'react';
import { useThrottle } from '@opensite-ai/react-hooks';

function InputField() {
  const [value, setValue] = useState('');
  const throttledValue = useThrottle(value, 500, {
    leading: false,
    trailing: true
  });

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p>Throttled value: {throttledValue}</p>
    </div>
  );
}
```

### API Rate Limiting Example

```typescript
import { useState, useEffect } from 'react';
import { useThrottle } from '@opensite-ai/react-hooks';

function LiveData() {
  const [data, setData] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const throttledTrigger = useThrottle(updateTrigger, 2000);

  useEffect(() => {
    // API call is throttled to once every 2 seconds
    fetchLiveData().then(setData);
  }, [throttledTrigger]);

  // Trigger updates frequently, but API calls are throttled
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(t => t + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return <div>Data: {JSON.stringify(data)}</div>;
}
```

## API

### Parameters

1. `value`: The value to throttle
2. `interval`: Throttle interval in milliseconds
3. `options` (optional): Configuration object
   - `leading`: Execute on the leading edge. Defaults to `true`.
   - `trailing`: Execute on the trailing edge. Defaults to `true`.

### Return Value

Returns the throttled value.

## TypeScript

```typescript
interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

function useThrottle<T>(
  value: T,
  interval: number,
  options?: ThrottleOptions
): T;
```

## Throttle vs Debounce

- **Throttle**: Limits execution to once per interval (e.g., once every 200ms)
- **Debounce**: Delays execution until after a period of inactivity

Use throttle for:
- Scroll handlers
- Mouse movement
- Window resize
- Rate limiting API calls

## Use Cases

- Scroll position tracking
- Window resize handlers
- Mouse/touch tracking
- API rate limiting
- Performance optimization
- Real-time data updates

