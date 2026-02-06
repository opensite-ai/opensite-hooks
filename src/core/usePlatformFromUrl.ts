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
  | "github"
  | "discord"
  | "snapchat"
  | "dev"
  | "substack"
  | "reddit"
  | "pinterest"
  | "threads"
  | "twitch"
  | "whatsapp"
  | "telegram"
  | "medium"
  | "patreon"
  | "onlyfans"
  | "eventbrite"
  | "npmjs"
  | "crates"
  | "rubygems"
  | "behance"
  | "dribbble"
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

  // GitHub
  ["github.com", "github"],
  ["www.github.com", "github"],
  ["gist.github.com", "github"],
  ["raw.githubusercontent.com", "github"],
  ["github.io", "github"],

  // Discord
  ["discord.com", "discord"],
  ["www.discord.com", "discord"],
  ["discord.gg", "discord"],
  ["discordapp.com", "discord"],
  ["discordapp.net", "discord"],
  ["discord.new", "discord"],
  ["discord.gift", "discord"],
  ["discord.gifts", "discord"],
  ["dis.gd", "discord"],

  // Snapchat
  ["snapchat.com", "snapchat"],
  ["www.snapchat.com", "snapchat"],
  ["snap.com", "snapchat"],
  ["www.snap.com", "snapchat"],
  ["story.snapchat.com", "snapchat"],
  ["web.snapchat.com", "snapchat"],

  // Dev (Dev.to)
  ["dev.to", "dev"],
  ["www.dev.to", "dev"],

  // Substack
  ["substack.com", "substack"],
  ["www.substack.com", "substack"],

  // Reddit
  ["reddit.com", "reddit"],
  ["www.reddit.com", "reddit"],
  ["old.reddit.com", "reddit"],
  ["new.reddit.com", "reddit"],
  ["i.redd.it", "reddit"],
  ["v.redd.it", "reddit"],
  ["redd.it", "reddit"],
  ["preview.redd.it", "reddit"],

  // Pinterest
  ["pinterest.com", "pinterest"],
  ["www.pinterest.com", "pinterest"],
  ["pin.it", "pinterest"],
  ["in.pinterest.com", "pinterest"],
  ["br.pinterest.com", "pinterest"],
  ["uk.pinterest.com", "pinterest"],

  // Threads (Meta)
  ["threads.net", "threads"],
  ["www.threads.net", "threads"],
  ["threads.com", "threads"],
  ["www.threads.com", "threads"],

  // Twitch
  ["twitch.tv", "twitch"],
  ["www.twitch.tv", "twitch"],
  ["m.twitch.tv", "twitch"],

  // WhatsApp
  ["whatsapp.com", "whatsapp"],
  ["www.whatsapp.com", "whatsapp"],
  ["wa.me", "whatsapp"],
  ["web.whatsapp.com", "whatsapp"],

  // Telegram
  ["telegram.org", "telegram"],
  ["www.telegram.org", "telegram"],
  ["t.me", "telegram"],
  ["telegram.me", "telegram"],
  ["telegram.dog", "telegram"],

  // Medium
  ["medium.com", "medium"],
  ["www.medium.com", "medium"],
  // Note: Custom Medium domains would need additional logic

  // Patreon
  ["patreon.com", "patreon"],
  ["www.patreon.com", "patreon"],

  // OnlyFans
  ["onlyfans.com", "onlyfans"],
  ["www.onlyfans.com", "onlyfans"],

  // Eventbrite
  ["eventbrite.com", "eventbrite"],
  ["www.eventbrite.com", "eventbrite"],
  ["eventbrite.co.uk", "eventbrite"],
  ["eventbrite.com.au", "eventbrite"],
  ["eventbrite.ca", "eventbrite"],
  ["eventbrite.de", "eventbrite"],
  ["eventbrite.fr", "eventbrite"],
  ["eventbrite.es", "eventbrite"],
  ["eventbrite.it", "eventbrite"],
  ["eventbrite.ie", "eventbrite"],
  ["eventbrite.nl", "eventbrite"],
  ["eventbrite.co.nz", "eventbrite"],
  ["eventbriteapi.com", "eventbrite"],
  ["evbuc.com", "eventbrite"],

  // npm
  ["npmjs.com", "npmjs"],
  ["www.npmjs.com", "npmjs"],
  ["npmjs.org", "npmjs"],
  ["www.npmjs.org", "npmjs"],
  ["registry.npmjs.org", "npmjs"],
  ["registry.npmjs.com", "npmjs"],
  ["replicate.npmjs.com", "npmjs"],

  // Crates.io (Rust)
  ["crates.io", "crates"],
  ["www.crates.io", "crates"],

  // RubyGems
  ["rubygems.org", "rubygems"],
  ["www.rubygems.org", "rubygems"],

  // Behance
  ["behance.net", "behance"],
  ["www.behance.net", "behance"],
  // Optional: catch common subdomains if you see them in your data
  ["portfolio.behance.net", "behance"],
  ["mir-s3-cdn-cf.behance.net", "behance"],

  // Dribbble
  ["dribbble.com", "dribbble"],
  ["www.dribbble.com", "dribbble"],
  ["drbl.in", "dribbble"],
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

      // O(1) Map lookup first (fastest)
      const platform = PLATFORM_HOSTNAME_MAP.get(hostname);

      if (platform) {
        return platform;
      }

      // Fallback pattern matching for custom domains (slower but more comprehensive)
      if (hostname.endsWith(".substack.com")) {
        return "substack";
      }
      if (hostname.endsWith(".github.io")) {
        return "github";
      }
      if (hostname.includes("pinterest.com")) {
        return "pinterest";
      }
      if (hostname.includes("eventbrite.")) {
        return "eventbrite";
      }
      if (hostname.endsWith(".medium.com")) {
        return "medium";
      }
      if (hostname.endsWith(".behance.net")) {
        return "behance";
      }

      return "unknown";
    } catch {
      return "unknown";
    }
  }, [url]);
}
