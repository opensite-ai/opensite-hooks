# useMap

A hook for managing Map state with convenient helper methods.

## Features

- Full Map API support
- Immutable updates
- Helper methods for common operations
- TypeScript support with generic key/value types
- Reactive state updates

## Usage

### Basic Example

```typescript
import { useMap } from '@opensite-ai/react-hooks';

function UserList() {
  const [users, actions] = useMap<string, { name: string; age: number }>();

  const addUser = () => {
    actions.set('user1', { name: 'John', age: 30 });
  };

  return (
    <div>
      <button onClick={addUser}>Add User</button>
      <ul>
        {Array.from(users.entries()).map(([id, user]) => (
          <li key={id}>
            {user.name} ({user.age})
            <button onClick={() => actions.remove(id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Initial State Example

```typescript
import { useMap } from '@opensite-ai/react-hooks';

function ProductCatalog() {
  const [products, actions] = useMap<string, number>([
    ['apple', 1.99],
    ['banana', 0.99],
    ['orange', 2.49]
  ]);

  return (
    <div>
      {Array.from(products.entries()).map(([name, price]) => (
        <div key={name}>
          {name}: ${price}
          <button onClick={() => actions.remove(name)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

### Cache Management Example

```typescript
import { useMap } from '@opensite-ai/react-hooks';

function DataCache() {
  const [cache, actions] = useMap<string, any>();

  const fetchData = async (key: string) => {
    if (actions.has(key)) {
      return actions.get(key);
    }

    const data = await fetch(`/api/${key}`).then(r => r.json());
    actions.set(key, data);
    return data;
  };

  const clearCache = () => {
    actions.clear();
  };

  return (
    <div>
      <button onClick={clearCache}>Clear Cache</button>
      <p>Cached items: {cache.size}</p>
    </div>
  );
}
```

### Form Fields Example

```typescript
import { useMap } from '@opensite-ai/react-hooks';

function DynamicForm() {
  const [fields, actions] = useMap<string, string>();

  const handleChange = (name: string, value: string) => {
    actions.set(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = Object.fromEntries(fields.entries());
    console.log('Form data:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Name"
        onChange={(e) => handleChange('name', e.target.value)}
      />
      <input
        placeholder="Email"
        onChange={(e) => handleChange('email', e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Bulk Operations Example

```typescript
import { useMap } from '@opensite-ai/react-hooks';

function BulkUpdate() {
  const [items, actions] = useMap<number, string>();

  const loadItems = () => {
    const newItems: [number, string][] = [
      [1, 'Item 1'],
      [2, 'Item 2'],
      [3, 'Item 3']
    ];
    actions.setAll(newItems);
  };

  return (
    <div>
      <button onClick={loadItems}>Load Items</button>
      <button onClick={actions.clear}>Clear All</button>
      <p>Total items: {items.size}</p>
    </div>
  );
}
```

## API

### Parameters

- `initialState` (optional): Initial Map or array of key-value pairs

### Return Value

Returns a tuple `[map, actions]`:

- `map`: Current Map instance
- `actions`: Object with helper methods:
  - `set(key, value)`: Add or update a key-value pair
  - `setAll(entries)`: Replace all entries with new Map or array
  - `remove(key)`: Remove a key-value pair
  - `clear()`: Remove all entries
  - `get(key)`: Get value for a key
  - `has(key)`: Check if key exists

## TypeScript

```typescript
interface MapActions<K, V> {
  set: (key: K, value: V) => void;
  setAll: (entries: Map<K, V> | [K, V][]) => void;
  remove: (key: K) => void;
  clear: () => void;
  get: (key: K) => V | undefined;
  has: (key: K) => boolean;
}

function useMap<K, V>(
  initialState?: Map<K, V> | [K, V][]
): [Map<K, V>, MapActions<K, V>];
```

## Use Cases

- Cache management
- Form field tracking
- User preferences
- Dynamic collections
- State normalization
- Lookup tables

