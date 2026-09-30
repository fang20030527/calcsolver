# CalcSolver.info

A static CalcSolver calculator and Code Mode activity site, with a graphite and yellow visual design and original math guides. Built with Astro and TypeScript. Canonical domain: **https://calcsolver.info**.

## Run locally

Use Node.js 24 (or Node 22.12+ for the app; tests require built-in TypeScript support).

```sh
npm ci
npm run dev
```

The default local address is `http://127.0.0.1:4321/`.

```sh
npm run verify
npm run preview
```

`verify` runs Astro type checking, behavior tests, the production build and output/link checks. `preview` serves the built `dist/` directory.

See [visual refresh notes](docs/visual-refresh.md) for the current design and browser verification.

See [SEO optimization notes](docs/seo-optimization.md) for keyword headings, structured data, indexing rules, sharing metadata and post-deployment checks.

## Features

- Paper white, graphite and yellow visual system with Manrope typography; responsive homepage, scientific calculator and math reference directory.
- Safe expression parser: arithmetic, brackets, powers, percentages, factorials, constants and degree-based functions. No JavaScript `eval`.
- Code Mode: **0000** opens the activity directory. Other four-digit codes open their activities.
- 130 external activity entries plus two locally hosted games.
- Local **2048 Classic (3001)** and **Snake (3002)**, with keyboard/touch controls and saved best scores.
- Activity search, source selection, player, recommendations, restart and fullscreen controls.
- 31 original math guides, 3 category pages, About, Contact, Privacy and 404.
- `.info` canonical metadata, robots and sitemap.

## Important configuration

- Branding and domain: `src/data/site.ts` and `astro.config.mjs`.
- External activities: `src/data/activities.json`.
- Approved embed hosts and local entries: `src/lib/activities.ts`.
- Math topics: `src/data/articles.ts`.
- Create a real support mailbox, then set `PUBLIC_CONTACT_EMAIL` in the deployment environment and rebuild. An empty value produces no email link; the website does not assume a mailbox exists.

The catalog is a snapshot of public metadata observed at CalcSolver.net on 2026-09-30. External game files and thumbnails remain on the provider's servers. Only local games are self-contained; external availability, provider advertising and embedding permissions can change. The other reference-site server APIs were inaccessible and are not presented as working mirrors.

Display results use JavaScript floating-point arithmetic, rounded to 12 significant digits. Use explicit multiplication, e.g. `2*pi`. A postfix percent converts the preceding value to a fraction of 100; `200+10%` is `200.1`, while a 10% increase is `200*(1+10%)`.

## Deployment

See [deployment instructions](docs/deployment.md). Both Cloudflare Pages and Vercel can serve `dist/`; no database or server application is needed. Purchasing a domain does not configure hosting or DNS automatically.

Cloudflare Pages is the selected hosting platform. The [deployment workflow](.github/workflows/deploy.yml) verifies and publishes every push to `main` to the existing `calcsolver-info` project. Configure its repository secret and variable as described in the deployment instructions. A failed verification stops publication.

For a manual upload, run `./scripts/package-pages.ps1` on Windows after verification to create `artifacts/calcsolver-info-cloudflare-pages.zip`. Screenshots are also saved in `artifacts/`.
