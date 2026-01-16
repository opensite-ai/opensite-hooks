# useSessionStorage

A hook for managing state synchronized with sessionStorage with automatic serialization.

## Features

- Automatic sessionStorage synchronization
- Custom serialization/deserialization
- Optional cross-tab synchronization
- SSR-safe
- TypeScript support with generic types
- Error handling for quota/security issues

## Usage

### Basic Example

```typescript
import { useSessionStorage } from '@opensite/hooks/useSessionStorage';

function FormWizard() {
  const [step, setStep] = useSessionStorage('wizardStep', 1);

  return (
    <div>
      <p>Current Step: {step}</p>
      <button onClick={() => setStep(step + 1)}>Next Step</button>
      <button onClick={() => setStep(step - 1)} disabled={step === 1}>
        Previous Step
      </button>
    </div>
  );
}
```

### Form Draft Example

```typescript
import { useSessionStorage } from '@opensite/hooks/useSessionStorage';

interface FormData {
  name: string;
  email: string;
  message: string;
}

function ContactForm() {
  const [formData, setFormData] = useSessionStorage<FormData>('contactForm', {
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(formData);
    // Clear session storage after successful submit
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
      />
      <input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <textarea
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="Message"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Search Filters Example

```typescript
import { useSessionStorage } from '@opensite/hooks/useSessionStorage';

interface SearchFilters {
  category: string;
  priceRange: [number, number];
  sortBy: string;
}

function ProductSearch() {
  const [filters, setFilters] = useSessionStorage<SearchFilters>('searchFilters', {
    category: 'all',
    priceRange: [0, 1000],
    sortBy: 'relevance'
  });

  return (
    <div>
      <select
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="all">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>
      <select
        value={filters.sortBy}
        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
      >
        <option value="relevance">Relevance</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>
  );
}
```

### Tab State Example

```typescript
import { useSessionStorage } from '@opensite/hooks/useSessionStorage';

function TabbedInterface() {
  const [activeTab, setActiveTab] = useSessionStorage('activeTab', 'profile');

  return (
    <div>
      <div className="tabs">
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  );
}
```

### Custom Serialization Example

```typescript
import { useSessionStorage } from '@opensite/hooks/useSessionStorage';

function DateRangePicker() {
  const [dateRange, setDateRange] = useSessionStorage<[Date, Date]>(
    'dateRange',
    [new Date(), new Date()],
    {
      serialize: ([start, end]) => JSON.stringify([start.toISOString(), end.toISOString()]),
      deserialize: (str) => {
        const [start, end] = JSON.parse(str);
        return [new Date(start), new Date(end)];
      }
    }
  );

  return (
    <div>
      <input
        type="date"
        value={dateRange[0].toISOString().split('T')[0]}
        onChange={(e) => setDateRange([new Date(e.target.value), dateRange[1]])}
      />
      <input
        type="date"
        value={dateRange[1].toISOString().split('T')[0]}
        onChange={(e) => setDateRange([dateRange[0], new Date(e.target.value)])}
      />
    </div>
  );
}
```

## API

### Parameters

1. `key`: sessionStorage key (string)
2. `initialValue`: Initial value if key doesn't exist
3. `options` (optional): Configuration object
   - `initializeWithValue`: Read from sessionStorage on mount. Defaults to `true`.
   - `serialize`: Custom serialization function. Defaults to `JSON.stringify`.
   - `deserialize`: Custom deserialization function. Defaults to `JSON.parse`.
   - `listenToStorageChanges`: Listen for changes in other tabs. Defaults to `false`.

### Return Value

Returns a tuple `[storedValue, setValue]`:
- `storedValue`: Current value from sessionStorage
- `setValue`: Function to update the value (supports function updater pattern)

## TypeScript

```typescript
interface SessionStorageOptions<T> {
  initializeWithValue?: boolean;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  listenToStorageChanges?: boolean;
}

function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options?: SessionStorageOptions<T>
): [T, (value: T | ((current: T) => T)) => void];
```

## Differences from useLocalStorage

- Data persists only for the session (cleared when tab/window closes)
- `listenToStorageChanges` defaults to `false` (vs `true` for localStorage)
- Better for temporary state that shouldn't persist across sessions

## Use Cases

- Form drafts
- Multi-step wizards
- Search filters
- Tab state
- Temporary user preferences
- Shopping session data

