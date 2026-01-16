# useOnClickOutside

A hook for detecting clicks outside of specified element(s).

## Features

- Single or multiple element support
- Customizable event types
- Event listener options support
- TypeScript support with generic element types
- Automatic cleanup

## Usage

### Basic Example

```typescript
import { useRef } from 'react';
import { useOnClickOutside } from '@opensite/hooks/useOnClickOutside';

function Dropdown() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useOnClickOutside(dropdownRef, () => {
    setIsOpen(false);
  });

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && (
        <div ref={dropdownRef} className="dropdown">
          <ul>
            <li>Option 1</li>
            <li>Option 2</li>
            <li>Option 3</li>
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Modal Example

```typescript
import { useRef } from 'react';
import { useOnClickOutside } from '@opensite/hooks/useOnClickOutside';

function Modal({ onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(modalRef, onClose);

  return (
    <div className="modal-overlay">
      <div ref={modalRef} className="modal-content">
        <h2>Modal Title</h2>
        <p>Modal content goes here</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

### Multiple Elements Example

```typescript
import { useRef } from 'react';
import { useOnClickOutside } from '@opensite/hooks/useOnClickOutside';

function Toolbar() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Close when clicking outside both button and menu
  useOnClickOutside([buttonRef, menuRef], () => {
    setIsOpen(false);
  });

  return (
    <div>
      <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>
        Menu
      </button>
      {isOpen && (
        <div ref={menuRef} className="menu">
          Menu items
        </div>
      )}
    </div>
  );
}
```

### Custom Event Type Example

```typescript
import { useRef } from 'react';
import { useOnClickOutside } from '@opensite/hooks/useOnClickOutside';

function ContextMenu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Use mouseup instead of mousedown
  useOnClickOutside(menuRef, () => {
    setIsOpen(false);
  }, 'mouseup');

  return (
    <div>
      {isOpen && (
        <div ref={menuRef} className="context-menu">
          Context menu items
        </div>
      )}
    </div>
  );
}
```

### Touch Events Example

```typescript
import { useRef } from 'react';
import { useOnClickOutside } from '@opensite/hooks/useOnClickOutside';

function MobileMenu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Use touchstart for better mobile support
  useOnClickOutside(menuRef, () => {
    setIsOpen(false);
  }, 'touchstart');

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Menu</button>
      {isOpen && (
        <div ref={menuRef} className="mobile-menu">
          Menu content
        </div>
      )}
    </div>
  );
}
```

### Popover Example

```typescript
import { useRef } from 'react';
import { useOnClickOutside } from '@opensite/hooks/useOnClickOutside';

function Popover({ trigger, content }) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useOnClickOutside(popoverRef, () => {
    setIsVisible(false);
  });

  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setIsVisible(!isVisible)}>
        {trigger}
      </div>
      {isVisible && (
        <div ref={popoverRef} className="popover">
          {content}
        </div>
      )}
    </div>
  );
}
```

## API

### Parameters

1. `ref`: Single ref or array of refs to elements
2. `handler`: Callback function when click occurs outside
3. `eventType` (optional): Event type to listen for. Options: `'mousedown'`, `'mouseup'`, `'click'`, `'touchstart'`, `'pointerdown'`. Defaults to `'mousedown'`.
4. `options` (optional): AddEventListenerOptions or boolean for capture phase

### Return Value

This hook does not return a value.

## TypeScript

```typescript
function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T> | Array<React.RefObject<T>>,
  handler: (event: MouseEvent | TouchEvent | PointerEvent) => void,
  eventType?: 'mousedown' | 'mouseup' | 'click' | 'touchstart' | 'pointerdown',
  options?: AddEventListenerOptions | boolean
): void;
```

## Use Cases

- Dropdown menus
- Modal dialogs
- Popovers and tooltips
- Context menus
- Mobile navigation
- Autocomplete suggestions
- Date pickers
- Color pickers

