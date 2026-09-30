# Deploy calcsolver.info

Build and verify before uploading:

```sh
npm ci
npm run verify
```

The static site is in `dist/`. Keep the project source and lockfile in version control; do not publish `.env` or `node_modules`.

## Cloudflare Pages

这是本项目已选定的部署平台。当前仓库尚未连接远程 Git 仓库，可先上传构建包。

Windows 上运行 `./scripts/package-pages.ps1`，生成 `artifacts/calcsolver-info-cloudflare-pages.zip`。上传包内的 `index.html` 位于根目录，包含本站所有页面与资源。

在 Workers & Pages 创建 Pages 应用，选择 Direct Upload，将 ZIP 上传并部署。更新网站时重新构建、打包，再创建新的部署。Direct Upload 项目以后需要另建项目才能改为 Git 自动部署；这是 Cloudflare 的项目类型限制。[官方说明](https://developers.cloudflare.com/pages/get-started/direct-upload/)

1. In Workers & Pages, create a Pages project. Use an existing Git repository, or choose Direct Upload for the built `dist/` directory.
2. For a Git-connected build, use `npm run build` and output directory `dist`. Use Node 24 (`NODE_VERSION=24`) so the local and hosted runtimes match.
3. Open the `pages.dev` preview and check calculator, activity codes 0000/3001/3002, category links and mobile layout.
4. In the project's Custom domains settings, add `calcsolver.info`. Follow Cloudflare's domain verification and DNS instructions. Using an apex domain on Pages normally requires the domain's DNS zone in the same Cloudflare account.
5. Add `www.calcsolver.info` if desired and configure its redirect to the canonical apex. Keep the apex as the canonical domain.
6. Verify HTTPS, `https://calcsolver.info/robots.txt` and `https://calcsolver.info/sitemap.xml` after DNS completes.

Use the project's Custom domains flow to bind the domain before changing DNS. Do not guess DNS records or point the domain at an unverified project.

Cloudflare references: [Astro deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/), [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/), [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Vercel

The repository includes `vercel.json` for the static Astro build. Import the Git repository into Vercel, verify the preview, then add `calcsolver.info` under the project domain settings. Apply the exact DNS records displayed for that project and wait for verification and TLS activation. Do not reuse DNS values from another project.

## Contact, ads and analytics

Create a working contact mailbox before setting `PUBLIC_CONTACT_EMAIL`. The contact link is determined at build time.

No first-party ads or analytics are included. Connect your own publisher/analytics account if desired, and update the privacy policy to match actual behavior. Do not reuse the reference site's account identifiers.

## Activity sources

The site has two real source options: all activities (132 entries) and local games (2). The external catalog entries use publicly observed provider URLs. The allowed domains are explicit in `src/lib/activities.ts`.

To use another provider, configure only URLs you intend to embed, confirm that provider's embedding terms and behavior, update the host allowlist and catalog, then rebuild. Do not convert missing or blocked URLs into fake “working server” options.

Local games use iframe permission for user-initiated top navigation, so their Calculator link can return to the site's homepage. External games do not get that permission. Leaving the player removes its iframe source.
