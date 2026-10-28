# stillsmith.is-my.app

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
| `public/CNAME` | The custom domain, copied into the build |

## Screenshots

They are not hand-taken. `.github/workflows/screenshots.yml` runs
`StillsmithUITests/StillsmithScreenshotTests`, exports the attachments from the result
bundle, and publishes them as the `app-screenshots` artifact (`home`, `settings`,
`tutorial`). Download that artifact and copy the three PNGs into
`public/assets/screens/` with those names.

## Domain

`stillsmith.is-my.app` is a CNAME to `casperong.github.io`, registered in
[jn-aman/is-my.app](https://github.com/jn-aman/is-my.app) as `domains/stillsmith.json`.
The domain is set on this repository's Pages site, so GitHub issues the certificate.
