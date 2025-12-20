# Development Guide

## Overview

This document describes development standards and workflows for `@opensite/hooks`.

## Architecture

### Directory Structure

```
opensite-hooks/
├── src/
│   ├── core/                # Core hook implementations
│   ├── hooks/               # Re-exported hook entrypoints
│   └── index.ts             # Root exports
├── dist/                    # Build output (gitignored)
├── scripts/
│   └── emit-cjs.js           # CJS emitter for Node require()
├── vite.umd.config.ts       # UMD build for CDN usage
└── tsconfig.json
```

### Design Principles

1. Performance-first: minimal bundle impact and no unnecessary re-renders.
2. SSR-safe: no direct browser API usage during render.
3. Tree-shakable: granular exports for small imports.
4. No runtime dependencies: React only.

## Development Workflow

### Setup

```bash
pnpm install
```

### Commands

```bash
# Watch TypeScript output
pnpm run build:watch

# Build ESM/CJS + UMD
pnpm run build

# Lint
pnpm lint

# Run tests
pnpm test
```

## Release Checklist

1. Update `CHANGELOG.md`.
2. Bump version in `package.json`.
3. Run `pnpm run build`.
4. Tag and publish.
