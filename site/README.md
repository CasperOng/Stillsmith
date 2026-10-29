# stillsmith.is-my.app

Live at <https://stillsmith.is-my.app>.

The Stillsmith page. One static page, built with Vite, deployed to GitHub Pages by
`.github/workflows/pages.yml`.

## Local development

```bash
cd site
npm install
npm run dev      # http://localhost:5173
npm run build    # → site/dist
```

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | The page |
| `src/style.css` | Tokens and the whole visual system |
| `src/main.js` | The transport demo, nav, copy buttons, entrance motion |
| `src/studio.js` | The browser workshop: loading, marking, extraction and downloads |
| `src/zip.js` | A store-only ZIP writer for "Download all" |
| `public/assets/sample.mp4`, `sample.webm` | The sample reel, encoded as H.264 and VP9 |
| `public/assets/fonts` | Syne, Space Grotesk and JetBrains Mono, self-hosted (OFL) |
| `public/assets/screens` | Screenshots captured from the app by the UI tests |
| `public/assets/signature.svg` | Casper Ong's signature, shared with casperong.is-a.dev |
| `public/favicon.ico`, `favicon-96.png`, `favicon-192.png`, `apple-touch-icon.png` | The app icon, resized from `Stillsmith/Assets.xcassets/AppIcon.appiconset` |
| `public/site.webmanifest` | Name and icons used when the page is installed |
| `public/CNAME` | The custom domain, copied into the build |

## Screenshots

They are not hand-taken. `.github/workflows/screenshots.yml` runs
`StillsmithUITests/StillsmithScreenshotTests`, exports the attachments from the result
bundle, and publishes them as the `app-screenshots` artifact (`home`, `settings`,
`tutorial`). Download that artifact and copy the three PNGs into
`public/assets/screens/` with those names.

## The browser workshop

`#try` runs the app's flow in the page. A chosen video is read locally with
`URL.createObjectURL`, marks are kept as seconds, and extraction seeks the video and
draws each moment to a canvas at the video's own pixel dimensions. Frames download one
at a time, or as one ZIP built in the page. Nothing is uploaded: the only requests are
the sample assets and the published source JSON.

The sample reel is an eight-second countdown drawn with the page's fonts, kept as both
`sample.mp4` (H.264) and `sample.webm` (VP9) so a browser without H.264 still plays it.

## The source address

`https://stillsmith.is-my.app/sources` is the address people paste into Feather, AltStore
or SideStore. `site/public/sources` holds a snapshot; the Pages workflow overwrites
`dist/sources` and `dist/sources.json` with the live feed on every build, and rebuilds
every six hours so the version in the source is never far behind. If the feed cannot be
fetched, the snapshot is served instead and the deploy continues.

## Share card

`site/public/share-card.html` is the 1200×630 share card, drawn with the page's own
tokens and fonts. `site/public/og.png` is its render:

```bash
cd site/public
python3 -m http.server 8811
# then, from a directory with playwright installed:
#   page.goto("http://localhost:8811/share-card.html")
#   page.screenshot({ path: "og.png" })
```

Update the card when the page's copy changes, and keep `og:image:width`/`height` in
`index.html` at 1200×630.

## Domain

`stillsmith.is-my.app` is a CNAME to `casperong.github.io`, registered in
[jn-aman/is-my.app](https://github.com/jn-aman/is-my.app) as `domains/stillsmith.json`.
The domain is set on this repository's Pages site, so GitHub issues the certificate.
