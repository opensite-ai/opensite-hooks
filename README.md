![Opensite AI Utility Hooks](https://octane.cdn.ing/api/v1/images/transform?url=https://cdn.ing/assets/i/r/285728/knsbi168qz1imlat2aq042c10rw8/opensite-react-hooks.png&q=90&f=webp)

# OpenSite React Hooks Library

High-performance React hooks for state management, storage, and more.

## Overview

The OpenSite React Hooks Library provides a suite of high-performance hooks designed to enhance React applications with efficient state management, storage, and event handling capabilities. This library is part of OpenSite AI's open-source ecosystem, emphasizing modularity, performance, and developer-friendly design. Learn more at [OpenSite AI](https://opensite.ai).

## Key Features

- **Performance-Optimized Hooks**: Built to ensure minimal impact on your application's performance.
- **Modular Design**: Use only what you need with tree-shakable exports and hook-level entry points.
- **SEO-Friendly**: Designed with best practices to ensure high performance and accessibility.
- **Wide Range of Capabilities**: Includes hooks for event handling, storage management, responsive utilities, and more.

## Installation

To use the OpenSite React Hooks Library, ensure you have Node.js installed. Then, add the library to your project:

```
npm install @opensite-ai/react-hooks
```

### Dependencies

- React and React DOM (version 16.8 or higher)


## Available Hooks

| Hook | Description | Documentation |
|------|-------------|---------------|
| [useBoolean](./docs/useBoolean.md) | Manage boolean state with convenient helper methods | [View Docs](./docs/useBoolean.md) |
| [useCopyToClipboard](./docs/useCopyToClipboard.md) | Copy text to clipboard with automatic reset and browser compatibility | [View Docs](./docs/useCopyToClipboard.md) |
| [useDebounceCallback](./docs/useDebounceCallback.md) | Debounce callback functions with advanced options | [View Docs](./docs/useDebounceCallback.md) |
| [useDebounceValue](./docs/useDebounceValue.md) | Debounce state values with configurable delay | [View Docs](./docs/useDebounceValue.md) |
| [useEventListener](./docs/useEventListener.md) | Attach event listeners to DOM elements with automatic cleanup | [View Docs](./docs/useEventListener.md) |
| [useHover](./docs/useHover.md) | Detect hover state on elements using pointer events | [View Docs](./docs/useHover.md) |
| [useIsClient](./docs/useIsClient.md) | Detect if code is running on client-side or server-side | [View Docs](./docs/useIsClient.md) |
| [useIsomorphicLayoutEffect](./docs/useIsomorphicLayoutEffect.md) | SSR-safe layout effect hook | [View Docs](./docs/useIsomorphicLayoutEffect.md) |
| [useLocalStorage](./docs/useLocalStorage.md) | Manage state synchronized with localStorage | [View Docs](./docs/useLocalStorage.md) |
| [useMap](./docs/useMap.md) | Manage Map state with convenient helper methods | [View Docs](./docs/useMap.md) |
| [useMediaQuery](./docs/useMediaQuery.md) | Responsive design using CSS media queries | [View Docs](./docs/useMediaQuery.md) |
| [useOnClickOutside](./docs/useOnClickOutside.md) | Detect clicks outside of specified elements | [View Docs](./docs/useOnClickOutside.md) |
| [usePrevious](./docs/usePrevious.md) | Access the previous value of a state or prop | [View Docs](./docs/usePrevious.md) |
| [useResizeObserver](./docs/useResizeObserver.md) | Observe element size changes using ResizeObserver API | [View Docs](./docs/useResizeObserver.md) |
| [useSessionStorage](./docs/useSessionStorage.md) | Manage state synchronized with sessionStorage | [View Docs](./docs/useSessionStorage.md) |
| [useThrottle](./docs/useThrottle.md) | Throttle value changes with configurable options | [View Docs](./docs/useThrottle.md) |

## Configuration or Advanced Usage

Customize the behavior of `useThrottle` with various options:

```javascript
import { useThrottle } from '@opensite-ai/react-hooks';

const throttledValue = useThrottle(value, 300, { leading: true, trailing: false });
```

## Performance Notes

Performance is a core facet of everything we build. The OpenSite React Hooks Library makes use of advanced techniques to optimize rendering and state updates, ensuring that your applications remain fast and responsive.

## Contributing

We welcome contributions from the community. For contribution guidelines, visit our [GitHub repository](https://github.com/opensite-ai).

## License

This project is licensed under the BSD 3-Clause License. See the [LICENSE](./LICENSE) file for more details.

## Related Projects

- [OpenSite Domain Extractor](https://github.com/opensite-ai/domain_extractor): A high-performance Rust utility for domain extraction.
- [OpenSite Page Speed Hooks](https://github.com/opensite-ai/page-speed-hooks): Tools to enhance page load performance.

Visit [OpenSite AI](https://opensite.ai) for more projects and information.
