![Opensite AI Utility Hooks](https://octane.cdn.ing/api/v1/images/transform?url=https://cdn.ing/assets/i/r/285728/knsbi168qz1imlat2aq042c10rw8/opensite-react-hooks.png&q=90&f=webp)

# @opensite/hooks

Performance-first React hooks for UI state, storage, events, and responsive behavior.

[![npm version](https://img.shields.io/npm/v/@opensite/hooks.svg)](https://www.npmjs.com/package/@opensite/hooks)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@opensite/hooks)](https://bundlephobia.com/package/@opensite/hooks)
[![license](https://img.shields.io/npm/l/@opensite/hooks.svg)](./LICENSE)

## Overview

`@opensite/hooks` provides a suite of zero-dependency, tree-shakable React hooks designed for high-performance marketing sites and web applications. All hooks are SSR-safe and optimized for Core Web Vitals.

**Key Features:**

- 🚀 **Zero dependencies** – Only React as a peer dependency
- 🌳 **Tree-shakable** – Import only what you use with flat exports
- 🔒 **SSR-safe** – All hooks handle server-side rendering correctly
- ⚡ **Performance-first** – Memoized callbacks, minimal re-renders
- 📦 **Multiple formats** – ESM, CJS, and UMD builds included

## Installation

```bash
# npm
npm install @opensite/hooks

# pnpm
pnpm add @opensite/hooks

# yarn
yarn add @opensite/hooks
```

### Requirements

- React 17.0.0 or higher
- React DOM 17.0.0 or higher

## Quick Start

### Direct Import (Recommended)

Import individual hooks for optimal tree-shaking and minimal bundle size:

```typescript
import { useBoolean } from '@opensite/hooks/useBoolean';
import { useLocalStorage } from '@opensite/hooks/useLocalStorage';
import { useMediaQuery } from '@opensite/hooks/useMediaQuery';
```

### Barrel Import (Not Recommended)

While supported, barrel imports increase bundle size and should be avoided in production:

```typescript
// ⚠️ AVOID: Imports entire library, defeats tree-shaking
import { useBoolean, useLocalStorage, useMediaQuery } from '@opensite/hooks';
```

### CDN Usage (UMD)

For legacy browser environments only:

```html
<script src="https://cdn.jsdelivr.net/npm/@opensite/hooks/dist/browser/opensite-hooks.umd.js"></script>
<script>
  const { useBoolean, useDebounceValue } = window.OpensiteHooks;
</script>
```

## Available Hooks

| Hook | Description | Docs |
|------|-------------|------|
| **State Management** | | |
| [`useBoolean`](./docs/useBoolean.md) | Boolean state with toggle, setTrue, setFalse helpers | [View](./docs/useBoolean.md) |
| [`useMap`](./docs/useMap.md) | Map state with set, remove, clear helpers | [View](./docs/useMap.md) |
| [`usePrevious`](./docs/usePrevious.md) | Access the previous value of a state or prop | [View](./docs/usePrevious.md) |
| **Storage** | | |
| [`useLocalStorage`](./docs/useLocalStorage.md) | Synchronized state with localStorage + cross-tab sync | [View](./docs/useLocalStorage.md) |
| [`useSessionStorage`](./docs/useSessionStorage.md) | Synchronized state with sessionStorage | [View](./docs/useSessionStorage.md) |
| **Timing** | | |
| [`useDebounceValue`](./docs/useDebounceValue.md) | Debounce value changes with configurable delay | [View](./docs/useDebounceValue.md) |
| [`useDebounceCallback`](./docs/useDebounceCallback.md) | Debounce callbacks with cancel/flush controls | [View](./docs/useDebounceCallback.md) |
| [`useThrottle`](./docs/useThrottle.md) | Throttle value changes with leading/trailing options | [View](./docs/useThrottle.md) |
| **DOM & Events** | | |
| [`useEventListener`](./docs/useEventListener.md) | Attach event listeners with automatic cleanup | [View](./docs/useEventListener.md) |
| [`useOnClickOutside`](./docs/useOnClickOutside.md) | Detect clicks outside specified elements | [View](./docs/useOnClickOutside.md) |
| [`useHover`](./docs/useHover.md) | Detect hover state using pointer events | [View](./docs/useHover.md) |
| [`useResizeObserver`](./docs/useResizeObserver.md) | Observe element size changes | [View](./docs/useResizeObserver.md) |
| **Responsive** | | |
| [`useMediaQuery`](./docs/useMediaQuery.md) | Reactive CSS media query matching | [View](./docs/useMediaQuery.md) |
| **Utilities** | | |
| [`useCopyToClipboard`](./docs/useCopyToClipboard.md) | Copy text to clipboard with feedback state | [View](./docs/useCopyToClipboard.md) |
| [`usePlatformFromUrl`](./docs/usePlatformFromUrl.md) | Resolve a social platform name from a URL | [View](./docs/usePlatformFromUrl.md) |
| [`useIsClient`](./docs/useIsClient.md) | Detect client-side vs server-side rendering | [View](./docs/useIsClient.md) |
| [`useIsomorphicLayoutEffect`](./docs/useIsomorphicLayoutEffect.md) | SSR-safe useLayoutEffect | [View](./docs/useIsomorphicLayoutEffect.md) |
| **Website Extractors** | | |
| [`useOpenGraphExtractor`](./docs/useOpenGraphExtractor.md) | Fetch and normalize Open Graph data with debouncing and caching | [View](./docs/useOpenGraphExtractor.md) |
| [`useWebsiteSchemaExtractor`](./docs/useWebsiteSchemaExtractor.md) | Extract Schema.org data from a website | [View](./docs/useWebsiteSchemaExtractor.md) |
| [`useWebsiteLinksExtractor`](./docs/useWebsiteLinksExtractor.md) | Extract outbound and internal link data from a webpage | [View](./docs/useWebsiteLinksExtractor.md) |
| [`useWebsiteMetaExtractor`](./docs/useWebsiteMetaExtractor.md) | Extract title, description, and meta tags from a webpage | [View](./docs/useWebsiteMetaExtractor.md) |
| [`useWebsiteRssExtractor`](./docs/useWebsiteRssExtractor.md) | Extract RSS feed information from a website | [View](./docs/useWebsiteRssExtractor.md) |

## Examples

### useBoolean

```typescript
import { useBoolean } from '@opensite/hooks/useBoolean';

function Modal() {
  const { value: isOpen, setTrue: open, setFalse: close, toggle } = useBoolean(false);

  return (
    <>
      <button onClick={open}>Open Modal</button>
      {isOpen && (
        <dialog open>
          <p>Modal content</p>
          <button onClick={close}>Close</button>
        </dialog>
      )}
    </>
  );
}
```

### useDebounceValue

```typescript
import { useState } from 'react';
import { useDebounceValue } from '@opensite/hooks/useDebounceValue';

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounceValue(query, 300);

  // API call only triggers when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### useMediaQuery

```typescript
import { useMediaQuery } from '@opensite/hooks/useMediaQuery';

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <div className={prefersDark ? 'dark' : 'light'}>
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </div>
  );
}
```

### useLocalStorage

```typescript
import { useLocalStorage } from '@opensite/hooks/useLocalStorage';

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  );
}
```

## Migration from v1.x

Version 2.0.0 simplifies import paths. Update your imports:

```diff
- import { useBoolean } from '@opensite/hooks/core/useBoolean';
- import { useBoolean } from '@opensite/hooks/hooks/useBoolean';
+ import { useBoolean } from '@opensite/hooks/useBoolean';
```

The `/core/*` and `/hooks/*` paths have been removed. Use flat paths (`/useBoolean`) for optimal tree-shaking.

## TypeScript

All hooks are written in TypeScript and include full type definitions. Types are exported alongside hooks:

```typescript
import { useBoolean, type UseBooleanResult } from '@opensite/hooks/useBoolean';
import { useLocalStorage, type StorageOptions } from '@opensite/hooks/useLocalStorage';
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/opensite-ai/opensite-hooks.git
cd opensite-hooks

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build
```

## License

[BSD-3-Clause](./LICENSE) © [OpenSite AI](https://opensite.ai)

## Related Projects

- [@opensite/ui](https://github.com/opensite-ai/opensite-ui) – React component library for OpenSite
- [@opensite/blocks](https://github.com/opensite-ai/opensite-blocks) – Semantic page blocks for site builders
- [@page-speed/forms](https://github.com/opensite-ai/page-speed-forms) – Framework-agnostic form handling

Visit [OpenSite AI](https://opensite.ai) for more projects and information.
