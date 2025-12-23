# usePrevious

A hook for accessing the previous value of a state or prop.

## Features

- Track previous values
- Useful for comparisons
- Works with any type
- TypeScript support with generic types
- Minimal performance overhead

## Usage

### Basic Example

```typescript
import { useState } from 'react';
import { usePrevious } from '@opensite-ai/react-hooks';

function Counter() {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previousCount ?? 'N/A'}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Value Change Detection Example

```typescript
import { useState, useEffect } from 'react';
import { usePrevious } from '@opensite-ai/react-hooks';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const previousSearchTerm = usePrevious(searchTerm);

  useEffect(() => {
    if (searchTerm !== previousSearchTerm) {
      console.log(`Search changed from "${previousSearchTerm}" to "${searchTerm}"`);
      // Perform search
    }
  }, [searchTerm, previousSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Props Comparison Example

```typescript
import { useEffect } from 'react';
import { usePrevious } from '@opensite-ai/react-hooks';

function UserProfile({ userId }: { userId: string }) {
  const previousUserId = usePrevious(userId);

  useEffect(() => {
    if (userId !== previousUserId) {
      console.log(`User changed from ${previousUserId} to ${userId}`);
      // Fetch new user data
      fetchUserData(userId);
    }
  }, [userId, previousUserId]);

  return <div>User ID: {userId}</div>;
}
```

### Animation Direction Example

```typescript
import { useState } from 'react';
import { usePrevious } from '@opensite-ai/react-hooks';

function Slider({ items }: { items: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const previousIndex = usePrevious(currentIndex);

  const direction = previousIndex !== undefined && currentIndex > previousIndex
    ? 'forward'
    : 'backward';

  return (
    <div>
      <div className={`slide slide-${direction}`}>
        {items[currentIndex]}
      </div>
      <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}>
        Previous
      </button>
      <button onClick={() => setCurrentIndex(i => Math.min(items.length - 1, i + 1))}>
        Next
      </button>
    </div>
  );
}
```

### Form Dirty State Example

```typescript
import { useState } from 'react';
import { usePrevious } from '@opensite-ai/react-hooks';

function FormField({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const previousValue = usePrevious(value);

  const isDirty = value !== initialValue;
  const hasChanged = value !== previousValue;

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {isDirty && <span>Unsaved changes</span>}
      {hasChanged && <span>Value just changed!</span>}
    </div>
  );
}
```

### Object Comparison Example

```typescript
import { useState } from 'react';
import { usePrevious } from '@opensite-ai/react-hooks';

interface Settings {
  theme: string;
  language: string;
}

function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    language: 'en'
  });
  const previousSettings = usePrevious(settings);

  const handleSave = () => {
    if (previousSettings) {
      const changes = Object.keys(settings).filter(
        key => settings[key] !== previousSettings[key]
      );
      console.log('Changed fields:', changes);
    }
  };

  return (
    <div>
      <select
        value={settings.theme}
        onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

## API

### Parameters

- `value`: The value to track

### Return Value

Returns the previous value, or `undefined` on the first render.

## TypeScript

```typescript
function usePrevious<T>(value: T): T | undefined;
```

## How It Works

The hook stores the value in a ref and updates it after each render, ensuring you always have access to the value from the previous render cycle.

## Use Cases

- Detecting value changes
- Animation direction
- Form dirty state tracking
- Undo functionality
- Comparison logic
- Debugging state changes
- Conditional effects based on previous values

