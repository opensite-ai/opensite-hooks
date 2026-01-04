# useCopyToClipboard

A hook for copying text to the clipboard with automatic reset and browser compatibility.

## Features

- Cross-browser clipboard support
- Automatic reset after configurable delay
- Browser capability detection
- Fallback for older browsers
- TypeScript support

## Usage

### Basic Example

```typescript
import { useCopyToClipboard } from '@opensite/hooks';

function CopyButton() {
  const { copy, copiedText, isSupported } = useCopyToClipboard();

  if (!isSupported) {
    return <p>Clipboard not supported</p>;
  }

  return (
    <div>
      <button onClick={() => copy('Hello, World!')}>
        {copiedText ? 'Copied!' : 'Copy Text'}
      </button>
    </div>
  );
}
```

### Code Snippet Example

```typescript
import { useCopyToClipboard } from '@opensite/hooks';

function CodeSnippet({ code }: { code: string }) {
  const { copy, copiedText } = useCopyToClipboard({ resetDelay: 3000 });

  return (
    <div className="code-block">
      <pre>{code}</pre>
      <button onClick={() => copy(code)}>
        {copiedText ? '✓ Copied' : 'Copy Code'}
      </button>
    </div>
  );
}
```

### Share Link Example

```typescript
import { useCopyToClipboard } from '@opensite/hooks';

function ShareButton() {
  const { copy, copiedText } = useCopyToClipboard({ resetDelay: 2000 });
  const currentUrl = window.location.href;

  const handleShare = async () => {
    const success = await copy(currentUrl);
    if (success) {
      console.log('Link copied successfully!');
    }
  };

  return (
    <button onClick={handleShare}>
      {copiedText ? 'Link Copied!' : 'Share Link'}
    </button>
  );
}
```

## API

### Parameters

- `options` (optional): Configuration object
  - `resetDelay`: Time in milliseconds before resetting `copiedText` to `null`. Defaults to `2000`.

### Return Value

Returns an object with:

- `copy`: Async function to copy text to clipboard. Returns `Promise<boolean>` indicating success.
- `copiedText`: The last successfully copied text, or `null` if nothing copied or after reset delay.
- `isSupported`: Boolean indicating if clipboard API is supported in the current browser.

## TypeScript

```typescript
interface UseCopyToClipboardOptions {
  resetDelay?: number;
}

interface CopyToClipboardResult {
  copy: (text: string) => Promise<boolean>;
  copiedText: string | null;
  isSupported: boolean;
}

function useCopyToClipboard(
  options?: UseCopyToClipboardOptions
): CopyToClipboardResult;
```

## Browser Support

The hook automatically detects and uses the best available method:
- Modern browsers: `navigator.clipboard.writeText()`
- Older browsers: `document.execCommand('copy')` fallback
- SSR: Returns `isSupported: false`

