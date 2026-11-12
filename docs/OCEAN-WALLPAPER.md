# Ocean Blue wallpaper

Ocean Blue is the default for installations without a `wallpaper-v1` preference. Settings → Darstellung → Hintergrund offers Ocean Blue and the unchanged previous Yosemite image. Selection uses the existing local settings database and backup flow. Invalid imported IDs fall back to Ocean Blue. No personal records are migrated or erased.

The owner-approved `Ocean-Blue-Mehr-Bewegung.mp4` is copied byte-for-byte: 1920×1080, 30 fps, eight-second silent H.264 loop. The poster is extracted from that video. The source image was generated for this project on 2026-11-12 and animated with periodic displacement; it does not embed the social-media references or UI.

One muted, playsinline video moves between desktop and lockscreen. Desktop is sharp; the lockscreen background receives 18 px blur without blurring the clock, cover or controls. Ocean Blue takes priority over the optional album-art background; the album cover/player remain unchanged. Selecting Yosemite restores existing album-art preference behavior. Glass-material sampling uses the selected still poster to avoid per-frame GPU texture uploads.

Reduced motion, a hidden page, suspension or a playback rejection shows the poster. A later touch retries blocked playback. Page exit releases the decoder; BFCache resume restores it. Reduced transparency keeps its existing no-blur behavior.

The MP4 and poster are local allowlisted assets, included in SRI/integrity generation and the atomic offline cache. Verified cached MP4s answer Safari byte-range requests (206/416). The static verification server also supports MP4 ranges. No network permissions or Tailscale settings change.

Validation: run `npm test`, `npm run build`, `npm run check`, and `node scripts/test-ipad-wallpaper.cjs` with AIR_PAD_PLAYWRIGHT/AIR_PAD_CHROMIUM if needed. Physical iPad/Safari playback still needs device acceptance.
