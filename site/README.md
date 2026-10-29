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
| `src/main.js` | The transport demo, copy button, entrance motion |
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
