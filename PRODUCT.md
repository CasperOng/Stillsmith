# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite, vanilla HTML/CSS/JS, built to `site/dist` and deployed to GitHub Pages by `.github/workflows/pages.yml`. Chosen over plain static HTML so the page can grow (fonts, assets, more routes) without a rewrite.

## Users

Two audiences, in this order:

1. **People who want the app.** iPhone or iPad users who shoot or receive video and need a still from it: thumbnails, a poster frame, a pose to study, a frame to print. They sideload unsigned builds (Feather, AltStore) or build from Xcode. iOS 17 or later.
2. **People looking at the developer's work.** They arrive from casperong.is-a.dev or a portfolio link and want to see what was built and how it behaves.

## Product Purpose

Stillsmith pulls the exact frame out of a video at the video's own resolution. The visitor should understand that in one viewport, see the real interface, and be able to install it in two steps. Success: the visitor installs the app, or leaves having understood what it does and that its developer ships real things.

## Positioning

Frame marking happens *during playback*, against the running video, with the mark recorded at the playhead's exact time — then every marked frame is written to the photo library at full resolution, named after its source. No conversion presets, no editing timeline, no account. Distribution is honest about its constraints: unsigned builds, installed through Feather or built from source.

## Operating Context

Sideloading with Feather from a public source; the app's own photo picker; videos handed over by share sheet, Files, AirDrop or `stillsmith://` links; frames saved into a custom photo album. The site is read on a phone as often as a desktop, usually right before installing.

## Capabilities and Constraints

iOS 17+, iPhone and iPad. Unsigned builds only, no App Store distribution. Frames are saved to Photos at source resolution; extraction is cancelable; the library keeps thumbnails and reloads full-resolution frames on demand; Dynamic Type, VoiceOver and Reduce Motion are supported; the share extension hands videos over through an App Group when signing allows, otherwise through the app's Files folder.

Site constraints: no claims the product cannot back up (no speeds, no user counts, no testimonials), no third-party analytics, real screenshots only, no invented interface imagery.

## Brand Commitments

- Product name: **Stillsmith**.
- Developer: **Casper Ong** (casperong.is-a.dev). The footer carries his signature, the “Developed by Casper Ong” credit line, and links to his site and GitHub.
- Type family shared with casperong.is-a.dev: Syne (display), Space Grotesk (body), JetBrains Mono (timecodes and data).
- Voice: plain, specific, dry. No hype, no exclamation marks, no slogans that could belong to another app.

## Evidence on Hand

- App icon: `Stillsmith/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png`
- Screenshots captured from the current build by the UI tests (home, settings, tutorial) — see `.github/workflows/screenshots.yml`
- Signature: `site/src/assets/signature.svg` (from casperong.is-a.dev)
- Install facts: GitHub repository `CasperOng/Stillsmith`, Feather source `stillsmith-feather`
- Behaviour facts: `CHANGELOG.md`, `README.md`, the app's own copy

## Product Principles

1. Show the mechanism, not adjectives the product cannot prove.
2. The interface is the evidence: real screenshots, real behaviour, real numbers of steps.
3. One tool, one job. The page never implies editing, conversion or a subscription.
4. Ship the constraint in the open: unsigned, sideload-first, and that is fine.

## Accessibility & Inclusion

WCAG 2.2 AA contrast for text and controls; keyboard reachable; visible focus; `prefers-reduced-motion` honoured for the scrubber and reveals; screenshots carry descriptive alt text; body text resizable to 200% without loss.
