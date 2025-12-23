# useDebounceValue

A hook for debouncing state values with configurable delay and options.

## Features

- Debounce any value changes
- Configurable delay
- Leading and trailing edge options
- Automatic cleanup
- TypeScript support with generic types

## Usage

### Basic Example

```typescript
import { useState } from 'react';
import { useDebounceValue } from '@opensite-ai/react-hooks';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounceValue(searchTerm, 500);

  // This effect only runs when debouncedSearch changes
  useEffect(() => {
    if (debouncedSearch) {
      // Perform search with debounced value
      fetchSearchResults(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Filter List Example

```typescript
import { useState } from 'react';
import { useDebounceValue } from '@opensite-ai/react-hooks';

function FilteredList({ items }: { items: string[] }) {
  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebounceValue(filter, 300);

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(debouncedFilter.toLowerCase())
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter items..."
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

### API Request Example

```typescript
import { useState, useEffect } from 'react';
import { useDebounceValue } from '@opensite-ai/react-hooks';

function UserSearch() {
  const [username, setUsername] = useState('');
  const debouncedUsername = useDebounceValue(username, 500);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (debouncedUsername) {
      fetch(`/api/users/${debouncedUsername}`)
        .then(res => res.json())
        .then(setUserData);
    }
  }, [debouncedUsername]);

  return (
    <div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
      />
      {userData && <UserProfile data={userData} />}
    </div>
  );
}
```

### With Options

```typescript
import { useState } from 'react';
import { useDebounceValue } from '@opensite-ai/react-hooks';

function FormField() {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounceValue(value, 1000, {
    leading: true,
    trailing: true
  });

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

## API

### Parameters

1. `value`: The value to debounce
2. `delay`: Delay in milliseconds
3. `options` (optional): Debounce options
   - `leading`: Execute on the leading edge. Defaults to `false`.
   - `trailing`: Execute on the trailing edge. Defaults to `true`.
   - `maxWait`: Maximum time value can be delayed.

### Return Value

Returns the debounced value.

## TypeScript

```typescript
function useDebounceValue<T>(
  value: T,
  delay: number,
  options?: DebounceOptions
): T;
```

## Use Cases

- Search inputs
- Filter fields
- Form validation
- API request optimization
- Expensive computations

