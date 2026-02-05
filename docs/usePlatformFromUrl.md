# usePlatformFromUrl

A hook for identifying a known social platform from a URL string.

## Features

- O(1) hostname lookup via internal map
- SSR-safe (no browser globals)
- Handles common shorteners and URL variants
- Returns a safe "unknown" fallback for invalid URLs
- TypeScript-friendly union return type

## Usage

### Basic Example

```typescript
import { usePlatformFromUrl } from '@opensite/hooks/usePlatformFromUrl';

function SocialBadge({ url }: { url: string }) {
  const platform = usePlatformFromUrl(url);

  return (
    <div>
      Platform: <strong>{platform}</strong>
    </div>
  );
}
```

### Icon Mapping Example

```typescript
import { usePlatformFromUrl } from '@opensite/hooks/usePlatformFromUrl';

const iconMap = {
  instagram: 'IG',
  linkedin: 'IN',
  google: 'GO',
  facebook: 'FB',
  tiktok: 'TT',
  youtube: 'YT',
  yelp: 'YP',
  spotify: 'SP',
  apple: 'AP',
  x: 'X',
  unknown: 'LINK'
} as const;

function SocialIcon({ url }: { url: string }) {
  const platform = usePlatformFromUrl(url);

  return (
    <span aria-label={platform}>
      {iconMap[platform]}
    </span>
  );
}
```

### List Filtering Example

```typescript
import { usePlatformFromUrl } from '@opensite/hooks/usePlatformFromUrl';

function SocialLinks({ urls }: { urls: string[] }) {
  return (
    <ul>
      {urls.map((url) => {
        const platform = usePlatformFromUrl(url);

        if (platform === 'unknown') return null;

        return (
          <li key={url}>
            {platform}: {url}
          </li>
        );
      })}
    </ul>
  );
}
```

### Validation Example

```typescript
import { usePlatformFromUrl } from '@opensite/hooks/usePlatformFromUrl';

function UrlInput({ value }: { value: string }) {
  const platform = usePlatformFromUrl(value);
  const isSupported = platform !== 'unknown';

  return (
    <div>
      <input value={value} readOnly />
      <p>{isSupported ? `Detected: ${platform}` : 'Unsupported URL'}</p>
    </div>
  );
}
```

## API

### Parameters

- `url`: Full URL string to inspect. Must include protocol (`https://`).

### Return Value

Returns one of the supported platform names or `"unknown"` if the URL is invalid or not recognized.

## TypeScript

```typescript
type SocialPlatformName =
  | 'instagram'
  | 'linkedin'
  | 'google'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'yelp'
  | 'spotify'
  | 'apple'
  | 'x'
  | 'unknown';

function usePlatformFromUrl(url: string): SocialPlatformName;
```

## Supported Platforms

- Instagram (`instagram.com`, `instagr.am`)
- LinkedIn (`linkedin.com`, `lnkd.in`)
- Google (`google.com`, `maps.app.goo.gl`, `g.co`, `goo.gl`)
- Facebook (`facebook.com`, `fb.com`, `fb.me`)
- TikTok (`tiktok.com`, `vt.tiktok.com`, `vm.tiktok.com`)
- YouTube (`youtube.com`, `youtu.be`)
- Yelp (`yelp.com`)
- Spotify (`spotify.com`, `open.spotify.com`, `spoti.fi`, `spotify.link`)
- Apple (`apple.com`, `music.apple.com`, `apps.apple.com`, `itunes.apple.com`)
- X / Twitter (`x.com`, `twitter.com`, `t.co`)

## Notes

- The hook trims whitespace before parsing.
- Invalid or protocol-less URLs return `"unknown"`.
- Use `URLSearchParams` or other normalization upstream if you accept raw user input.
