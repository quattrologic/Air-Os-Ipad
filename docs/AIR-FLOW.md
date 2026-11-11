# AIR FLOW implementation

The existing Air-OS iPad design and its data owners remain the foundation. No
deployment, Tailscale configuration, PC repository, kernel or native binary is
part of this change.

## Analysis and implementation plan

- A: baseline: 53 Node regressions pass. `core/visual-motion.js` owns desktop
  WAAPI motion; `desktop.js` owns window geometry/lifecycle. Pro Notch already
  has one sampled surface timeline. `maclock.js` and `playback-history.js` share
  validated playback metadata. Widgets project the existing IndexedDB records.
- B: extend that scheduler with shared spring/easing/duration tokens, FLIP,
  artwork crossfades, finite touch light and device/reduced-motion policy.
- C: explicit wallpaper < clock < cover < controls layers; a small glass unlock
  target and a cancellable visual-session handover; retain the attached Notch
  surface and extend its metadata transitions.
- D: icon origins on open/return, animated minimize/restore and snap, transform
  dragging, stable dock nodes, category/navigation transitions.
- E: existing widgets gain notes, honest weather availability, reminder controls,
  music transport and accessible resize/reorder controls; improve existing app
  navigation, switches, calendar and photo viewing without replacing storage.
- F: Node/build/package checks and automated touch-browser regressions at iPad
  portrait/landscape sizes, with reduced motion and lifecycle checks. Report
  measurements as environment-specific evidence, never as an iPad FPS promise.

## References

The supplied MOVs were inspected as behavior references. The existing lock scene
is the design reference. The read-only HakiOS repository has no reproducible
widget UI/screenshot reference in its tree; no code or assets are imported from
it. Widget changes interpret the requested interaction quality within Air-OS.

Implementation details, test results and remaining limits are recorded below
after validation.


## Implemented behavior

`ipad/core/visual-motion.js` is the existing WAAPI owner, now with shared
spring/easing/duration tokens, sampled damped springs, cancellable FLIP,
content timing and decoded artwork crossfades. Reduced motion and hidden-page
cleanup resolve pending lifecycle promises. Economy mode shortens transitions
and avoids extra unlock blur on limited devices. Touch light is finite, follows
the pointer at a bounded update rate and never intercepts input.

`ipad/air-flow.css` refines existing surfaces without replacing icons, fonts or
wallpapers. Lock layers are explicit: wallpaper 0/1, clock 2, music 3 (cover 1,
player 2 inside that context), bottom controls/notifications 4. A responsive 14px
cover overlap is defined in CSS. The clock uses tabular numerals. The original
session logic remains a visual PWA session; it does not secure or replace iPadOS.
The small glass unlock target retains native button semantics and a 44px minimum.

`ipad/maclock.js` keeps the outgoing lock visible while the desktop enters, guards
rapid relock/unlock with a lease, crossfades decoded artwork and animates notices.
`ipad/notch/pro-notch.js` retains its existing attached, black surface and sampled
morph timeline. Last-known metadata, text/cover transitions and local transport
use the existing playback owner; Spotify remains read-only.

`ipad/desktop.js` keeps dock buttons and its material node alive across focus
changes. Window drags use temporary translation and commit position on release;
snaps use FLIP. Minimize/restore and close follow dock/icon geometry. A focused
window can cancel a pending departure without becoming hidden afterward. Exit
motion continues while another window receives focus. Category navigation uses
the same scheduler.

`ipad/widgets.js` keeps the existing clock/calendar/agenda/music composition and
adds stored note previews, reminder completion, local audio controls and an honest
weather placeholder. Notes open their exact saved record. Existing schema-2
records and playback history are reused. New order/size preferences live in one
`widget-layout-v1` setting, without database migration. Edit handles support pointer
reordering; labelled buttons provide another way to reorder/resize. Widgets stop
their minute/data refresh timer when the session or page is hidden.

`ipad/apps.js` adds native accessible switches, selected-sidebar feedback,
settings navigation, Finder folder/view transitions, animated calendar changes
and an actual photo dialog with previous/next, Escape and URL cleanup. Gallery export stays available.
Existing import, edit, save, delete and backup contracts remain in their owners.

## Verification and evidence

Commands (from the repository root):

```sh
npm test
npm run build
npm run check
npm run audit:public
AIR_PAD_CHROMIUM=/usr/bin/chromium npm run test:air-flow
AIR_PAD_CHROMIUM=/usr/bin/chromium node scripts/test-ipad-pro-notch.cjs
AIR_PAD_CHROMIUM=/usr/bin/chromium node scripts/test-ipad-desktop-dock.cjs
AIR_PAD_CHROMIUM=/usr/bin/chromium AIR_PAD_TEST_HISTORY=/path/to/pinned-fixtures npm run test:browser
AIR_PAD_CHROMIUM=/usr/bin/chromium AIR_FLOW_BASELINE=/path/to/previous-package npm run measure:air-flow
```

The Chromium executable override is optional on machines with Playwright's
browser installed. Existing CI runs Chromium and WebKit; AIR FLOW is now part
of that matrix. All local browser profiles contain synthetic fixtures only.
Reports are in `docs/testing/air-flow/`; full screenshots/reports are generated
under `dist/air-flow-*`, `dist/pro-notch-evidence`, `dist/desktop-dock-evidence`
and `dist/security-chromium`.

- Baseline: 53 Node tests pass. Final scheduler regressions bring this to 57.
- Build/package integrity: 143 exact allowlisted local assets pass.
- Existing Pro Notch browser suite: 71 checks, including real local playback,
  touch, sampled morph frames, portrait sizes, interruptions and cold offline use.
- Existing desktop/dock browser suite: 55 checks at DPR 2, including authorized
  Spotify mocks, native-safe targets, touch compatibility, viewport resize and
  cold offline restart.
- Existing security browser suite: 50 checks, including PKCE, scope boundaries,
  CSP, atomic updates, compatible rollback, backups and exact stored audio bytes.
- AIR FLOW browser suite: 32 checks. These cover actual foreground hit-testing across 1180×820,
  820×1180, 1024×768, 768×1024 and 1366×1024; unlock handover; placeholder images;
  original notes/tasks/files/calendar/audio; minimize cancellation and multiwindow
  focus; transforms during dragging; widget order/size persistence; photo dialog;
  OS/app reduced motion and widget inactivity while locked.

The old security task pinned the entire UI byte-for-byte. Only the six
explicitly changed presentation files were moved out of `unchangedFiles`;
their original hashes remain in `airFlowChanges.baselineFiles`. All other pins
still apply. The obsolete before/after pixel-equality assertion now records
pixel differences and checks identical viewport/session inputs. Stable settled
captures are still required, and AIR FLOW adds explicit layer/geometry/hit tests.
The existing dock test now checks hidden transport availability and the actual
crossfade artwork layer rather than the former single background image.

## Limits and open work

- No physical iPad was available. WebKit launch was attempted but its executable
  is absent; the official Playwright browser download returned HTTP 403
  `Domain forbidden` for `cdn.playwright.dev`. Local Safari/WebKit results are
  therefore not claimed. Run the configured WebKit CI job and test on iPad before
  merging for device use.
- Weather has no configured data source and displays that fact. Spotify controls
  remain read-only; local imported music has real transport controls.
- The current home architecture is a category launcher/workspace system. Its
  existing navigation is animated; no separate paged launcher or new app-folder
  storage model was introduced.
- Interactive window resize still uses the existing bounded, once-per-frame
  geometry updates so content reflows correctly. Window moving uses transforms.
- No wallpaper-color extraction or native system integration was added.
- Notch contour morphs still animate a small, isolated surface's geometry, as in
  the existing architecture. They are not claimed to be compositor-only.
- No app publication, hosting/access change, native binary import or PC reference
  modification occurred. The existing private setup/update scripts remain pinned.


## Measured comparison

Loopback Chromium 154, 1180×820 at DPR 1, eight calculator open/close cycles
plus a 24-step window drag. Before is the starting `4c365ab` package; after is
this implementation. The second measurement was run after the browser suites
finished. Both measurements are retained in the evidence directory.

| Measurement | Before | After |
| --- | ---: | ---: |
| Dock buttons removed/recreated across eight cycles | 208 / 208 | 0 / 0 |
| Dock material surfaces removed | 16 | 0 |
| Layouts during the 24-step drag | 32 | 1 |
| Drag layout duration | 5.6 ms | 0.2 ms |
| Median sampled frame interval | 16.7 ms | 16.7 ms |
| 95th percentile sampled frame interval | 33.2 ms | 16.8 ms |
| Long tasks during open/close | 0 | 0 |

The first measurement recorded 31→1 drag layouts, the same unchanged median,
and one 121ms after-build long task while other browser suites were active.
It is preserved as `performance-initial.json`; the isolated second result is
`performance.json`. These are diagnostic samples, not device FPS guarantees.
The structural reductions in disconnected nodes and drag layouts are the main
performance result.

## Changed files

- Runtime: `ipad/core/visual-motion.js`, `ipad/air-flow.css`, `ipad/app.js`,
  `ipad/maclock.js`, `ipad/notch/pro-notch.js`, `ipad/desktop.js`, `ipad/widgets.js`,
  `ipad/apps.js`, and generated `ipad/index.html`, `ipad/sw.js`, `ipad/version.json`.
- Build/source inventory: `build/ipad-runtime-assets.json`,
  `scripts/write-ipad-source.cjs`, `package.json`.
- Tests: `tests/ipad-air-flow.test.cjs`, `scripts/test-ipad-air-flow.cjs`,
  `scripts/measure-ipad-air-flow.cjs`, `tests/ipad-security.test.cjs`,
  `scripts/test-ipad-security.cjs`, `scripts/test-ipad-desktop-dock.cjs`,
  `.github/workflows/ipad-security-browser.yml`.
- Documentation/evidence: this file, `docs/testing/air-flow/*.json` and
  `docs/security/protected-surfaces.json`.
