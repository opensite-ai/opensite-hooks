# useBoolean

A hook for managing boolean state with convenient helper methods.

## Features

- Simple boolean state management
- Helper methods for common boolean operations
- Memoized callbacks for optimal performance
- TypeScript support with full type safety

## Usage

### Basic Example

```typescript
import { useBoolean } from '@opensite/hooks/useBoolean';

function ToggleComponent() {
  const { value, toggle, setTrue, setFalse } = useBoolean(false);

  return (
    <div>
      <p>Status: {value ? 'ON' : 'OFF'}</p>
      <button onClick={toggle}>Toggle</button>
      <button onClick={setTrue}>Turn On</button>
      <button onClick={setFalse}>Turn Off</button>
    </div>
  );
}
```

### Modal Example

```typescript
import { useBoolean } from '@opensite/hooks/useBoolean';

function ModalExample() {
  const { value: isOpen, setTrue: openModal, setFalse: closeModal } = useBoolean(false);

  return (
    <div>
      <button onClick={openModal}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <h2>Modal Content</h2>
          <button onClick={closeModal}>Close</button>
        </div>
      )}
    </div>
  );
}
```

### Form Validation Example

```typescript
import { useBoolean } from '@opensite/hooks/useBoolean';

function FormExample() {
  const { value: isValid, setTrue: markValid, setFalse: markInvalid } = useBoolean(false);
  const { value: isSubmitting, setTrue: startSubmit, setFalse: endSubmit } = useBoolean(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    startSubmit();
    try {
      // Submit form
      await submitForm();
    } finally {
      endSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={(e) => e.target.value ? markValid() : markInvalid()} />
      <button disabled={!isValid || isSubmitting}>Submit</button>
    </form>
  );
}
```

## API

### Parameters

- `defaultValue` (optional): Initial boolean value. Defaults to `false`.

### Return Value

Returns an object with the following properties:

- `value`: Current boolean value
- `setValue`: React state setter function
- `setTrue`: Function to set value to `true`
- `setFalse`: Function to set value to `false`
- `toggle`: Function to toggle the boolean value

## TypeScript

```typescript
interface UseBooleanResult {
  value: boolean;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}

function useBoolean(defaultValue?: boolean): UseBooleanResult;
```
