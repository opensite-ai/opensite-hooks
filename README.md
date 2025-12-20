![Opensite AI Utility Hooks](https://octane.cdn.ing/api/v1/images/transform?url=https://toastability-production.s3.amazonaws.com/gghtx0lxw9f2zigs427qc2phu024&q=85&f=avif)

---

# ⚡ @opensite/hooks

Performance-first React hooks for UI state, storage, events, and responsive behavior. Designed to be tree-shakable, SSR-safe, and CDN-ready.

[![npm version](https://img.shields.io/npm/v/@opensite/hooks?style=flat-square)](https://www.npmjs.com/package/@opensite/hooks)
[![npm downloads](https://img.shields.io/npm/dm/@opensite/hooks?style=flat-square)](https://www.npmjs.com/package/@opensite/hooks)
[![License](https://img.shields.io/npm/l/@opensite/hooks?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](./tsconfig.json)
[![Tree-Shakeable](https://img.shields.io/badge/Tree%20Shakeable-Yes-brightgreen?style=flat-square)](#tree-shaking)

## Overview

`@opensite/hooks` provides a focused set of high-performance React hooks that work across OpenSite and any open-source React project. Every hook is built for minimal bundle size, avoids unnecessary renders, and is safe for SSR.

## Installation

```bash
pnpm add @opensite/hooks
```

Peer deps: `react` and `react-dom` (17+).

## Quick Start

```tsx
import { useBoolean, useDebounceValue } from "@opensite/hooks";

export function SearchBox() {
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounceValue(query, 300);
  const { value: isOpen, setTrue, setFalse } = useBoolean(false);

  React.useEffect(() => {
    if (debouncedQuery) {
      // fetch results
    }
  }, [debouncedQuery]);

  return (
    <>
      <button onClick={setTrue}>Open</button>
      {isOpen && (
        <div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
          <button onClick={setFalse}>Close</button>
        </div>
      )}
    </>
  );
}
```

## Hooks

- `useBoolean` - Boolean state with stable togglers.
- `useDebounceValue` - Debounced state for inputs and API calls.
- `useDebounceCallback` - Debounced function wrapper with optional max wait.
- `useLocalStorage` - Persistent state with SSR-safe hydration.
- `useSessionStorage` - Session scoped storage state.
- `useOnClickOutside` - Dismiss components on outside clicks.
- `useMediaQuery` - Responsive JavaScript behavior.
- `useEventListener` - Safe event binding with cleanup.
- `useIsClient` - Hydration-safe client checks.
- `useCopyToClipboard` - Clipboard helper with fallback.
- `usePrevious` - Previous value tracking.
- `useThrottle` - Throttled state for scroll/resize events.
- `useResizeObserver` - ResizeObserver-based size tracking.
- `useHover` - Hover state with pointer events.
- `useIsomorphicLayoutEffect` - SSR-safe layout effect.
- `useMap` - Immutable Map state helpers.

## Tree Shaking

Prefer granular imports to minimize bundle size:

```tsx
import { useMediaQuery } from "@opensite/hooks/core/useMediaQuery";
import { useBoolean } from "@opensite/hooks/hooks/useBoolean";
```

## CDN / UMD

```html
<script src="https://cdn.jsdelivr.net/npm/@opensite/hooks@0.1.0/dist/browser/opensite-hooks.umd.js"></script>
<script>
  const { useBoolean } = window.OpensiteHooks;
</script>
```

## Documentation

- [CHANGELOG](./CHANGELOG.md)
- [CONTRIBUTING](./CONTRIBUTING.md)
- [DEVELOPMENT](./DEVELOPMENT.md)

## License

[BSD 3](./LICENSE) © [OpenSite AI](https://opensite.ai)
