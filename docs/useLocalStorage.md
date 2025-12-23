# useLocalStorage

A hook for managing state synchronized with localStorage with automatic serialization and cross-tab synchronization.

## Features

- Automatic localStorage synchronization
- Custom serialization/deserialization
- Cross-tab synchronization
- SSR-safe
- TypeScript support with generic types
- Error handling for quota/security issues

## Usage

### Basic Example

```typescript
import { useLocalStorage } from '@opensite-ai/react-hooks';

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

### Object Storage Example

```typescript
import { useLocalStorage } from '@opensite-ai/react-hooks';

interface UserSettings {
  notifications: boolean;
  language: string;
  fontSize: number;
}

function SettingsPanel() {
  const [settings, setSettings] = useLocalStorage<UserSettings>('userSettings', {
    notifications: true,
    language: 'en',
    fontSize: 16
  });

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.notifications}
          onChange={(e) => setSettings({
            ...settings,
            notifications: e.target.checked
          })}
        />
        Enable notifications
      </label>
      <select
        value={settings.language}
        onChange={(e) => setSettings({
          ...settings,
          language: e.target.value
        })}
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>
    </div>
  );
}
```

### Custom Serialization Example

```typescript
import { useLocalStorage } from '@opensite-ai/react-hooks';

function DatePicker() {
  const [selectedDate, setSelectedDate] = useLocalStorage<Date>(
    'selectedDate',
    new Date(),
    {
      serialize: (date) => date.toISOString(),
      deserialize: (str) => new Date(str)
    }
  );

  return (
    <input
      type="date"
      value={selectedDate.toISOString().split('T')[0]}
      onChange={(e) => setSelectedDate(new Date(e.target.value))}
    />
  );
}
```

### Shopping Cart Example

```typescript
import { useLocalStorage } from '@opensite-ai/react-hooks';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

function ShoppingCart() {
  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);

  const addItem = (item: CartItem) => {
    setCart([...cart, item]);
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h2>Cart ({cart.length} items)</h2>
      <p>Total: ${total.toFixed(2)}</p>
      {cart.map(item => (
        <div key={item.id}>
          {item.name} x {item.quantity}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

### With Function Updater

```typescript
import { useLocalStorage } from '@opensite-ai/react-hooks';

function Counter() {
  const [count, setCount] = useLocalStorage('count', 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setCount(c => c - 1)}>Decrement</button>
    </div>
  );
}
```

## API

### Parameters

1. `key`: localStorage key (string)
2. `initialValue`: Initial value if key doesn't exist
3. `options` (optional): Configuration object
   - `initializeWithValue`: Read from localStorage on mount. Defaults to `true`.
   - `serialize`: Custom serialization function. Defaults to `JSON.stringify`.
   - `deserialize`: Custom deserialization function. Defaults to `JSON.parse`.
   - `listenToStorageChanges`: Listen for changes in other tabs. Defaults to `true`.

### Return Value

Returns a tuple `[storedValue, setValue]`:
- `storedValue`: Current value from localStorage
- `setValue`: Function to update the value (supports function updater pattern)

## TypeScript

```typescript
interface StorageOptions<T> {
  initializeWithValue?: boolean;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  listenToStorageChanges?: boolean;
}

function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: StorageOptions<T>
): [T, (value: T | ((current: T) => T)) => void];
```

## Use Cases

- User preferences and settings
- Theme persistence
- Shopping cart
- Form draft saving
- Authentication tokens
- User session data
- Feature flags

