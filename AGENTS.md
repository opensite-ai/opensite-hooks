# AGENTS.md – Instructions for coding agents working on `@opensite/hooks`

This file is for **AI coding agents and maintainers**. It encodes the non‑obvious rules, constraints, and architectural decisions so automated changes stay fast, safe, and consistent.

When in doubt, favor: **(1) SSR/hydration safety, (2) tree-shakeability + bundle size, (3) memoization correctness**, in that order.

---

## 1. Quick mental model of this repo

- This is a **zero-dependency, tree-shakable React hooks library** for the OpenSite/DashTrack ecosystem.
- Hooks are designed for **high-performance marketing sites** with strict Core Web Vitals requirements.
- All hooks must be **SSR-safe** – they run in both server and browser environments without hydration mismatches.
- Distribution includes **ESM, CJS, and UMD** builds for maximum compatibility (bundlers, CDN, legacy Node).
- All hook implementations live in `src/core/`. Exports use **flat paths** (e.g., `@opensite/hooks/useBoolean`).

---

## 2. Golden rules (must follow)

1. **Every hook must be SSR-safe.**
   - Never access `window`, `document`, `localStorage`, `sessionStorage`, or browser APIs at module scope.
   - Always guard browser API usage with runtime checks: `typeof window !== "undefined"`.
   - Use `useIsClient` or `useIsomorphicLayoutEffect` for code that must run client-side only.

2. **Preserve tree-shaking.**
   - Keep individual hook files in `src/core/` with single exports.
   - Never add barrel re-exports that aggregate multiple hooks unless updating `src/core/index.ts`.
   - Each hook is exported via flat paths in `package.json` (e.g., `./useBoolean`).

3. **Memoize appropriately.**
   - Returned callbacks must be wrapped in `useCallback` with correct dependencies.
   - Returned objects/arrays should be stable across renders when inputs haven't changed.
   - Use `useRef` to avoid stale closures in event handlers and callbacks.

4. **Type exports alongside hooks.**
   - Every hook that accepts or returns a complex type must export that type.
   - Export interfaces for options objects and result types (e.g., `UseBooleanResult`, `StorageOptions<T>`).
   - Update `src/core/index.ts` to re-export new types.

5. **Zero runtime dependencies.**
   - The only peer dependencies are `react` and `react-dom` (>=17.0.0).
   - Do not add lodash, ramda, or any utility libraries.
   - Implement utilities from scratch or copy from existing hooks in this repo.

6. **Handle cleanup correctly.**
   - Event listeners, timers, observers, and subscriptions must be cleaned up on unmount.
   - Use the return function from `useEffect` or `useIsomorphicLayoutEffect` for cleanup.
   - Clear timeout/interval refs in cleanup to prevent memory leaks.

7. **Use `.js` extensions in imports.**
   - All internal imports must use explicit `.js` extensions: `import { useBoolean } from "./useBoolean.js"`.
   - This is required for ESM compatibility in Node.js with `"type": "module"`.

8. **Run verification before considering work complete.**
   - At minimum: `pnpm test` and `pnpm run build`.
   - The build must succeed for ESM, CJS, and UMD outputs.

---

## 3. Key directories (for navigation)

| Path | Purpose |
|------|---------|
| `src/core/` | **All hook implementations** – each hook is a separate file here |
| `src/core/index.ts` | Barrel export re-exporting all hooks and types |
| `src/index.ts` | Root entry that re-exports everything from `core/` |
| `scripts/emit-cjs.js` | Post-build script that duplicates `.js` files as `.cjs` |
| `vite.umd.config.ts` | UMD build config for CDN usage (`window.OpensiteHooks`) |
| `docs/` | Per-hook documentation with usage examples |

---

## 4. Hook categories and patterns

### 4.6 Website extractor hooks (revenue-critical)

These hooks are specialized wrappers around Octane extract endpoints and are
expected to become a revenue center once API key tracking is enabled. Treat them
as product-critical.

**Hooks**
- `useOpenGraphExtractor`
- `useWebsiteSchemaExtractor`
- `useWebsiteLinksExtractor`
- `useWebsiteMetaExtractor`
- `useWebsiteRssExtractor`

**Shared infrastructure**
- `src/core/useWebsiteExtractorBase.ts` (shared engine)
- `src/core/websiteExtractorService.ts` (request builder + fetch)
- `src/core/websiteExtractorTypes.ts` (shared types + defaults)

**Contract rules**
1. **Never fetch on the server.** These hooks must remain SSR-safe and only
   execute in the browser (`useIsClient` guard).
2. **Always debounce network calls.** Use the shared base hook so we avoid
   request storms and infinite re-render loops.
3. **Preserve response metadata.** The `meta` block (cache + body size info)
   must be surfaced for analytics and request tracking.
4. **Handle errors gracefully.** Upstream errors are expected; populate
   `error` with `{ message, status?, raw? }` without throwing.
5. **Respect caching and refresh.** Default to in-memory caching with a
   debounced `refresh()` to allow manual re-fetch without spamming the API.
6. **Keep URL handling consistent.** The only required query param is `url`,
   but always pass via `URLSearchParams` to support encoded query strings.
7. **OpenGraph skip patterns.** `useOpenGraphExtractor` must keep the default
   skip list for known-problem URLs (maps, opentable, etc).
8. **Base URL override.** Default to `https://octane.buzz`, but allow
   `baseUrl` for staging and testing.

**If you modify these hooks**
- Update docs in `docs/` for each hook.
- Add or adjust tests under `src/core/__tests__/`.
- Update exports in `src/core/index.ts` and `package.json`.

### 4.1 State hooks
**Examples:** `useBoolean`, `useMap`, `usePrevious`

Pattern:
- Return a tuple `[value, setter]` or an object with `value` and action methods.
- Memoize all action methods with `useCallback`.
- For objects with multiple actions, return a stable reference using `useMemo` or individual `useCallback`s.

### 4.2 Storage hooks
**Examples:** `useLocalStorage`, `useSessionStorage`

Pattern:
- Accept `key`, `initialValue`, and optional `options` object.
- Support custom `serialize`/`deserialize` functions for complex values.
- Handle storage events for cross-tab synchronization (localStorage) or opt-in sync (sessionStorage).
- Gracefully handle quota exceeded and security errors with try/catch.
- Return SSR-safe initial values when `window` is undefined.

### 4.3 Event/DOM hooks
**Examples:** `useEventListener`, `useOnClickOutside`, `useHover`, `useResizeObserver`

Pattern:
- Accept refs (`React.RefObject<T>`) as targets, not raw elements.
- Store handler in a ref to avoid re-subscribing on every render.
- Support configurable event options (capture, passive, once).
- Use `useIsomorphicLayoutEffect` when handler identity must be updated synchronously.

### 4.4 Timing hooks
**Examples:** `useDebounceValue`, `useDebounceCallback`, `useThrottle`

Pattern:
- Accept `value`, `delay`, and optional `options` for leading/trailing edge behavior.
- Support `maxWait` for debounce to guarantee eventual execution.
- Return `cancel` and `flush` controls for callback variants.
- Clean up pending timers on unmount.

### 4.5 SSR utility hooks
**Examples:** `useIsClient`, `useIsomorphicLayoutEffect`

Pattern:
- `useIsClient` returns `false` on server, `true` after first client render.
- `useIsomorphicLayoutEffect` is `useLayoutEffect` on client, `useEffect` on server.
- Use these to prevent hydration mismatches with browser-only code.

---

## 5. Adding a new hook

Follow this checklist when adding a new hook:

### 5.1 Implementation

1. **Create the hook file** in `src/core/useYourHook.ts`.
2. **Export the hook function** and any associated types/interfaces.
3. **Guard all browser APIs** with `typeof window !== "undefined"` checks.
4. **Memoize callbacks** with `useCallback` and appropriate dependencies.
5. **Clean up side effects** in useEffect return functions.
6. **Use `.js` extensions** in any internal imports.

### 5.2 Re-export setup

**Add to `src/core/index.ts`:**
```typescript
export { useYourHook } from "./useYourHook.js";
export type { YourHookOptions } from "./useYourHook.js";
```

### 5.3 Package exports

Add the new hook entry to `package.json` under the `exports` field:

```json
"./useYourHook": {
  "import": "./dist/core/useYourHook.js",
  "require": "./dist/core/useYourHook.cjs",
  "types": "./dist/core/useYourHook.d.ts"
}
```

### 5.4 Testing (REQUIRED)

**Every new hook MUST have a test file.** Create `src/core/__tests__/useYourHook.test.ts`:

```typescript
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useYourHook } from "../useYourHook.js";

describe("useYourHook", () => {
  describe("initialization", () => {
    it("should initialize with default value", () => {
      const { result } = renderHook(() => useYourHook());
      expect(result.current).toBeDefined();
    });
  });

  describe("core functionality", () => {
    // Test primary actions and state changes
  });

  describe("callback stability", () => {
    it("should maintain stable function references", () => {
      const { result, rerender } = renderHook(() => useYourHook());
      const initial = result.current;
      rerender();
      expect(result.current.someAction).toBe(initial.someAction);
    });
  });
});
```

Tests must cover: initialization, core functionality, edge cases, callback stability, and cleanup.

### 5.5 Documentation

Create `docs/useYourHook.md` with:
- Features list
- Basic usage example
- Advanced examples for each option
- Full API documentation (parameters, return values, types)

---

## 6. Critical SSR patterns

### 6.1 The hydration mismatch problem

React compares server-rendered HTML with client-rendered output. If they differ, you get hydration errors. Common causes:
- Reading `window.innerWidth` during initial render
- Using `Date.now()` or `Math.random()` in initial state
- Accessing localStorage before checking `typeof window`

### 6.2 Correct patterns in this library

**Safe initial state:**
```typescript
// ✅ Correct: guard browser APIs
const [value, setValue] = useState<boolean>(() => {
  if (typeof window === "undefined") {
    return options.defaultValue ?? false;
  }
  return window.matchMedia(query).matches;
});
```

**Client-only effects:**
```typescript
// ✅ Correct: use useEffect (not useState) for browser-only work
useEffect(() => {
  if (typeof window === "undefined") return;
  // Safe to access browser APIs here
}, []);
```

**Deferred client values:**
```typescript
// ✅ Correct: return SSR-safe value, update on mount
const [isClient, setIsClient] = useState(false);
useEffect(() => { setIsClient(true); }, []);
```

---

## 7. Build system

### 7.1 Build outputs

| Output | Path | Usage |
|--------|------|-------|
| ESM | `dist/*.js`, `dist/**/*.js` | Modern bundlers (Vite, Webpack 5, Rollup) |
| CJS | `dist/*.cjs`, `dist/**/*.cjs` | Node.js require(), Jest |
| UMD | `dist/browser/opensite-hooks.umd.js` | CDN `<script>` tags |
| Types | `dist/*.d.ts`, `dist/**/*.d.ts` | TypeScript consumers |

### 7.2 Build commands

```bash
pnpm run build        # Full build: ESM + CJS + UMD
pnpm run build:lib    # ESM + CJS only (tsc + emit-cjs.js)
pnpm run build:umd    # UMD only (vite)
pnpm run build:watch  # Watch mode for ESM (development)
```

### 7.3 How CJS is generated

The `scripts/emit-cjs.js` script copies every `.js` file in `dist/` to a `.cjs` counterpart. This works because ESM syntax is a superset of what CJS consumers need when using dynamic import or modern bundlers.

---

## 8. Testing

### 8.1 Test environment

- **Vitest** with `happy-dom` for DOM simulation
- **React Testing Library** for hook testing via `renderHook` and `act`
- **v8 coverage** provider for code coverage reporting
- Tests run with global test APIs (`describe`, `it`, `expect`, `vi`)

### 8.2 Test commands

```bash
pnpm test             # Run tests once
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report
pnpm test:ui          # Run tests with Vitest UI
```

### 8.3 Test file structure

| Path | Purpose |
|------|---------|
| `src/core/__tests__/` | All hook test files live here |
| `src/test/setup.ts` | Global test setup with browser API mocks |
| `src/test/utils.tsx` | Shared test utilities and helpers |
| `vitest.config.ts` | Vitest configuration |

### 8.4 Writing hook tests

**IMPORTANT: Every new hook and every update to an existing hook MUST have test coverage.**

Use `@testing-library/react` for hook testing:

```typescript
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useBoolean } from "../useBoolean.js";

describe("useBoolean", () => {
  it("should initialize with default value", () => {
    const { result } = renderHook(() => useBoolean(false));
    expect(result.current.value).toBe(false);
  });

  it("should toggle correctly", () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current.toggle();
    });

    expect(result.current.value).toBe(true);
  });

  it("should maintain stable callback references", () => {
    const { result, rerender } = renderHook(() => useBoolean(false));
    const initialToggle = result.current.toggle;

    rerender();

    expect(result.current.toggle).toBe(initialToggle);
  });
});
```

### 8.5 Test categories to cover

For each hook, tests should cover:

1. **Initialization** – Default values, initial props, SSR-safe defaults
2. **Core functionality** – Primary actions and state changes
3. **Edge cases** – Null refs, empty values, boundary conditions
4. **Callback stability** – Verify `useCallback` memoization is correct
5. **Cleanup** – Event listeners removed, timers cleared on unmount
6. **Type variations** – Different input types (strings, objects, arrays)

### 8.6 Testing with fake timers

For timing-related hooks (`useDebounceCallback`, `useThrottle`, etc.):

```typescript
import { vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("should debounce callback", () => {
  const callback = vi.fn();
  const { result } = renderHook(() => useDebounceCallback(callback, 100));

  act(() => {
    result.current.debouncedCallback("a");
    result.current.debouncedCallback("b");
    result.current.debouncedCallback("c");
  });

  expect(callback).not.toHaveBeenCalled();

  act(() => {
    vi.advanceTimersByTime(100);
  });

  expect(callback).toHaveBeenCalledWith("c");
});
```

### 8.7 Testing SSR behavior

The test setup includes browser API mocks. For explicit SSR testing:

```typescript
const originalWindow = global.window;
beforeEach(() => { delete (global as any).window; });
afterEach(() => { global.window = originalWindow; });

test("useMediaQuery returns defaultValue during SSR", () => {
  const { result } = renderHook(() =>
    useMediaQuery("(min-width: 768px)", { defaultValue: true })
  );
  expect(result.current).toBe(true);
});
```

### 8.8 Available test utilities

The `src/test/utils.tsx` file provides:

- `wait(ms)` – Promise-based delay for async tests
- `mockMatchMedia(matches)` – Create mock matchMedia result
- `createStorageEvent(key, newValue, oldValue)` – Create storage events
- `createResizeObserverEntry(target, width, height)` – Create ResizeObserver entries

### 8.9 Browser API mocks

The `src/test/setup.ts` file provides global mocks for:

- `window.matchMedia` – Returns mock MediaQueryList
- `ResizeObserver` – Mock implementation with observe/disconnect
- `navigator.clipboard` – Mock writeText/readText
- `localStorage` / `sessionStorage` – Mock storage with getItem/setItem/removeItem/clear

### 8.10 Coverage requirements

When adding or modifying hooks, aim for:

- **Statements:** ≥80%
- **Branches:** ≥75%
- **Functions:** ≥90%
- **Lines:** ≥80%

Run `pnpm test:coverage` to check coverage. Coverage reports are generated in HTML format at `coverage/index.html`.

---

## 9. Recommended workflows for agents

### 9.1 Modify an existing hook

1. Locate the implementation in `src/core/`.
2. **Review the existing tests in `src/core/__tests__/`** to understand expected behavior.
3. Make changes while preserving:
   - SSR safety (typeof checks on browser APIs)
   - Memoization stability (same deps = same callback identity)
   - Cleanup logic in useEffect returns
4. **Update or add tests to cover your changes.**
5. Update docs if behavior or API changes.
6. Run `pnpm test && pnpm run build`.

### 9.2 Add a new hook

1. Identify the closest existing hook as a template.
2. Follow the "Adding a new hook" checklist in section 5.
3. **Create a test file at `src/core/__tests__/useYourHook.test.ts`** (REQUIRED).
4. Write tests covering: initialization, core functionality, edge cases, callback stability.
5. Verify the build succeeds with all three outputs.
6. Run `pnpm test:coverage` to verify adequate coverage.

### 9.3 Fix a hydration issue

1. Identify where browser APIs are accessed during initial render.
2. Wrap the access in a `useEffect` that runs only on client.
3. Ensure initial state uses a server-safe default.
4. Test with SSR simulation (mock window as undefined).

### 9.4 Update package exports

1. Add entries to `package.json` `exports` field following existing patterns.
2. Run `pnpm run build` to verify TypeScript paths resolve correctly.
3. Test import paths work: `import { hook } from "@opensite/hooks/core/useHook"`.

---

## 10. Verification checklist

Before considering a change "done", an agent should:

- [ ] Run `pnpm test` – all tests pass.
- [ ] Run `pnpm run build` – ESM, CJS, and UMD builds succeed.
- [ ] **Tests exist for the hook** – Test file at `src/core/__tests__/useHookName.test.ts`.
- [ ] **Tests cover key behaviors** – Initialization, core functionality, edge cases, callback stability.
- [ ] Verify no TypeScript errors in `dist/*.d.ts` files.
- [ ] Confirm new hooks are SSR-safe (no browser API access at module scope or in useState initializers without guards).
- [ ] Confirm memoization is correct (callbacks use useCallback, objects are stable).
- [ ] Confirm cleanup is implemented for any subscriptions, timers, or observers.
- [ ] Update `docs/` if adding or changing hook API.
- [ ] Update `package.json` exports if adding new entry points.

**Testing is not optional.** Changes to hooks without corresponding test updates will be rejected.

If any of these cannot be completed, clearly note what was skipped and why in the PR description.

---

## 11. Common pitfalls to avoid

### 11.1 Stale closure in event handlers

**Wrong:**
```typescript
useEffect(() => {
  const listener = () => handler(value); // `value` is captured, goes stale
  window.addEventListener('click', listener);
  return () => window.removeEventListener('click', listener);
}, []); // Missing `value` dependency!
```

**Correct:**
```typescript
const handlerRef = useRef(handler);
useIsomorphicLayoutEffect(() => { handlerRef.current = handler; }, [handler]);

useEffect(() => {
  const listener = (e) => handlerRef.current(e); // Always calls latest handler
  window.addEventListener('click', listener);
  return () => window.removeEventListener('click', listener);
}, []);
```

### 11.2 Memory leaks from uncleared timers

**Wrong:**
```typescript
useEffect(() => {
  setTimeout(() => setDone(true), 1000);
}, []);
```

**Correct:**
```typescript
useEffect(() => {
  const id = setTimeout(() => setDone(true), 1000);
  return () => clearTimeout(id);
}, []);
```

### 11.3 Hydration mismatch from non-deterministic initial state

**Wrong:**
```typescript
const [width] = useState(window.innerWidth); // Crashes on server, mismatches on client
```

**Correct:**
```typescript
const [width, setWidth] = useState(0);
useEffect(() => { setWidth(window.innerWidth); }, []);
```

---

## 12. Persona and communication

- Optimize for correctness and long-term leverage, not agreement.
- Be direct, critical, and constructive – say when an approach is suboptimal and propose better options.
- Assume staff-level React and TypeScript context unless told otherwise.

---

## 13. Quality and SCM rules

- Inspect `package.json` scripts before running commands.
- Run all relevant checks (`pnpm test`, `pnpm run build`) before submitting changes.
- Never claim checks passed unless they were actually executed.
- Never use `git reset --hard` or force-push without explicit permission.
- Prefer safe alternatives (`git revert`, new commits, temp branches).
- Assume production impact – this library is used in customer-facing marketing sites.
