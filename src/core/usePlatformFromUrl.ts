import { useMemo } from "react";

/**
 * Supported social platform names
 */
export type SocialPlatformName =
  | "instagram"
  | "linkedin"
  | "google"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "yelp"
  | "spotify"
  | "apple"
  | "x"
  | "unknown";

/**
 * Platform hostname mappings for O(1) lookup performance.
 * Includes standard domains and known URL variants/shorteners.
 */
const PLATFORM_HOSTNAME_MAP = new Map<string, SocialPlatformName>([
  // Instagram
  ["instagram.com", "instagram"],
  ["www.instagram.com", "instagram"],
  ["instagr.am", "instagram"],
  ["www.instagr.am", "instagram"],

  // LinkedIn
  ["linkedin.com", "linkedin"],
  ["www.linkedin.com", "linkedin"],
  ["ca.linkedin.com", "linkedin"],
  ["uk.linkedin.com", "linkedin"],
  ["in.linkedin.com", "linkedin"],
  ["lnkd.in", "linkedin"],

  // Google (including Maps variants)
  ["google.com", "google"],
  ["www.google.com", "google"],
  ["maps.google.com", "google"],
  ["goo.gl", "google"],
  ["maps.app.goo.gl", "google"],
  ["g.co", "google"],

  // Facebook
  ["facebook.com", "facebook"],
  ["www.facebook.com", "facebook"],
  ["m.facebook.com", "facebook"],
  ["fb.com", "facebook"],
  ["fb.me", "facebook"],
  ["on.fb.me", "facebook"],

  // TikTok
  ["tiktok.com", "tiktok"],
  ["www.tiktok.com", "tiktok"],
  ["m.tiktok.com", "tiktok"],
  ["vm.tiktok.com", "tiktok"],
  ["vt.tiktok.com", "tiktok"],

  // YouTube
  ["youtube.com", "youtube"],
  ["www.youtube.com", "youtube"],
  ["m.youtube.com", "youtube"],
  ["youtu.be", "youtube"],

  // Yelp
  ["yelp.com", "yelp"],
  ["www.yelp.com", "yelp"],
  ["m.yelp.com", "yelp"],

  // Spotify
  ["spotify.com", "spotify"],
  ["www.spotify.com", "spotify"],
  ["open.spotify.com", "spotify"],
  ["play.spotify.com", "spotify"],
  ["spoti.fi", "spotify"],
  ["spotify.link", "spotify"],

  // Apple
  ["apple.com", "apple"],
  ["www.apple.com", "apple"],
  ["music.apple.com", "apple"],
  ["podcasts.apple.com", "apple"],
  ["apps.apple.com", "apple"],
  ["itunes.apple.com", "apple"],

  // X (formerly Twitter)
  ["x.com", "x"],
  ["www.x.com", "x"],
  ["twitter.com", "x"],
  ["www.twitter.com", "x"],
  ["t.co", "x"],
]);

/**
 * Extracts the social platform name from a URL string.
 * Uses the native URL API for validation and hostname extraction,
 * then performs O(1) Map lookup for platform identification.
 *
 * @param url - The URL string to analyze
 * @returns The identified platform name or "unknown" if not recognized
 *
 * @example
 * ```tsx
 * const platform = usePlatformFromUrl("https://www.youtube.com/@iamthedelo");
 * // Returns: "youtube"
 *
 * const platform = usePlatformFromUrl("https://maps.app.goo.gl/XDuog3V5fTuPcWCH7");
 * // Returns: "google"
 *
 * const platform = usePlatformFromUrl("https://twitter.com/jordanhudgens");
 * // Returns: "x"
 *
 * const platform = usePlatformFromUrl("not-a-url");
 * // Returns: "unknown"
 * ```
 */
export function usePlatformFromUrl(url: string): SocialPlatformName {
  return useMemo(() => {
    if (!url || typeof url !== "string") {
      return "unknown";
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return "unknown";
    }

    try {
      const urlObj = new URL(trimmedUrl);
      const hostname = urlObj.hostname.toLowerCase();

      const platform = PLATFORM_HOSTNAME_MAP.get(hostname);
      return platform ?? "unknown";
    } catch {
      return "unknown";
    }
  }, [url]);
}
