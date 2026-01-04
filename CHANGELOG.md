# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2025-01-04

### Added

- Website extraction hooks backed by Octane endpoints:
  - `useOpenGraphExtractor`
  - `useWebsiteSchemaExtractor`
  - `useWebsiteLinksExtractor`
  - `useWebsiteMetaExtractor`
  - `useWebsiteRssExtractor`
- Shared extractor infrastructure:
  - `useWebsiteExtractorBase` for debounced, cached, SSR-safe fetching
  - `websiteExtractorService` for consistent request building
  - `websiteExtractorTypes` for standardized meta/error types
- New docs for each extractor hook with usage patterns and API details.
- Full test coverage for all new extractor hooks.

### Changed

- Expanded package exports to include the new extractor hooks and shared
  website extractor utilities.

## [2.0.0] - 2025-01-04

### Breaking Changes

- **Simplified import paths** – Removed the redundant `/core/*` and `/hooks/*` export paths.

  **Migration required:**
  ```diff
  - import { useBoolean } from '@opensite/hooks/core/useBoolean';
  - import { useBoolean } from '@opensite/hooks/hooks/useBoolean';
  + import { useBoolean } from '@opensite/hooks/useBoolean';
  ```

- **Removed `src/hooks/` directory** – The re-export layer has been eliminated. All hook implementations now live exclusively in `src/core/`, with flat exports at the package level.

### Changed

- **Cleaner package structure** – Each hook now has a single export path (e.g., `@opensite/hooks/useBoolean`) instead of duplicate paths.
- **Reduced package size** – Removed duplicate re-export files from the published bundle.
- **Updated license identifier** – Changed from `BSD 3` to the SPDX-compliant `BSD-3-Clause`.

### How to Upgrade

1. Update your package: `pnpm add @opensite/hooks@2`
2. Find and replace import paths in your codebase:
   - Replace `/core/use` with `/use`
   - Replace `/hooks/use` with `/use`
3. Barrel imports (`import { ... } from '@opensite/hooks'`) continue to work unchanged.

---

## [0.1.0] - 2025-12-01

### Added

- Initial release with performance-focused React hooks: state, storage, events, media, and responsive utilities.
- Tree-shakable exports with core and hook-level entrypoints plus UMD build for CDN usage.
- 16 hooks included:
  - **State**: `useBoolean`, `useMap`, `usePrevious`
  - **Storage**: `useLocalStorage`, `useSessionStorage`
  - **Timing**: `useDebounceValue`, `useDebounceCallback`, `useThrottle`
  - **DOM/Events**: `useEventListener`, `useOnClickOutside`, `useHover`, `useResizeObserver`
  - **Responsive**: `useMediaQuery`
  - **Utilities**: `useCopyToClipboard`, `useIsClient`, `useIsomorphicLayoutEffect`

---

## License

[BSD-3-Clause](https://github.com/opensite-ai/opensite-hooks/LICENSE) © [OpenSite AI](https://opensite.ai)
