# useDebounceCallback

A hook for debouncing callback functions with advanced options for leading/trailing execution and maximum wait time.

## Features

- Debounce any callback function
- Leading and trailing edge execution options
- Maximum wait time support
- Manual cancel and flush controls
- Automatic cleanup on unmount
- TypeScript support with generic types

## Usage

### Basic Example

```typescript
import { useDebounceCallback } from '@opensite-ai/react-hooks';

function SearchInput() {
  const { debouncedCallback } = useDebounceCallback(
    (searchTerm: string) => {
      console.log('Searching for:', searchTerm);
      // Perform search
    },
    500
  );

  return (
    <input
      type="text"
      onChange={(e) => debouncedCallback(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### With Leading Edge

```typescript
import { useDebounceCallback } from '@opensite-ai/react-hooks';

function ButtonClick() {
  const { debouncedCallback } = useDebounceCallback(
    () => {
      console.log('Button clicked!');
    },
    1000,
    { leading: true, trailing: false }
  );

  return <button onClick={debouncedCallback}>Click Me</button>;
}
```

### With Cancel and Flush

```typescript
import { useDebounceCallback } from '@opensite-ai/react-hooks';

function FormInput() {
  const { debouncedCallback, cancel, flush } = useDebounceCallback(
    (value: string) => {
      console.log('Saving:', value);
      // Save to API
    },
    1000
  );

  return (
    <div>
      <input onChange={(e) => debouncedCallback(e.target.value)} />
      <button onClick={cancel}>Cancel Save</button>
      <button onClick={flush}>Save Now</button>
    </div>
  );
}
```

### With Maximum Wait

```typescript
import { useDebounceCallback } from '@opensite-ai/react-hooks';

function AutoSave() {
  const { debouncedCallback } = useDebounceCallback(
    (content: string) => {
      console.log('Auto-saving:', content);
      // Save content
    },
    2000,
    { maxWait: 5000 } // Force save after 5 seconds max
  );

  return (
    <textarea
      onChange={(e) => debouncedCallback(e.target.value)}
      placeholder="Type here... (auto-saves)"
    />
  );
}
```

## API

### Parameters

1. `callback`: The function to debounce
2. `delay`: Delay in milliseconds
3. `options` (optional): Configuration object
   - `leading`: Execute on the leading edge. Defaults to `false`.
   - `trailing`: Execute on the trailing edge. Defaults to `true`.
   - `maxWait`: Maximum time callback can be delayed before forced execution.

### Return Value

Returns an object with:

- `debouncedCallback`: The debounced version of the callback
- `cancel`: Function to cancel pending executions
- `flush`: Function to immediately execute pending callback

## TypeScript

```typescript
interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

interface DebouncedCallback<T extends (...args: any[]) => void> {
  debouncedCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
}

function useDebounceCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  options?: DebounceOptions
): DebouncedCallback<T>;
```

## Use Cases

- Search input fields
- Form auto-save
- Window resize handlers
- Scroll event handlers
- API request throttling

