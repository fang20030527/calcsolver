# Deploy calcsolver.info

## 自动部署状态 · 2026-09-30

- GitHub 默认分支和生产分支均为 `main`。推送会自动运行检查，再发布到现有 Cloudflare Pages 项目 `calcsolver-info`。
- 首次自动部署来自提交 `70cec4bdce91bdd5f5975f53e22f5f6c2e77fe87`，[Actions 运行 #1](https://github.com/fang20030527/calcsolver/actions/runs/36681672429)成功；安装依赖、完整验证和上传步骤均通过。
- 本次部署地址为 [e8a79922.calcsolver-info.pages.dev](https://e8a79922.calcsolver-info.pages.dev/)，正式域名为 [calcsolver.info](https://calcsolver.info/)。
- 正式域名首页只有一个 H1：`CalcSolver: Free online scientific calculator.`；canonical 为 `https://calcsolver.info/`，Organization、WebSite、WebPage 和 WebApplication JSON-LD 可解析。
- 正式域名计算 `2+3*4` 得到 `14`；文章、分类、PNG 分享图、`robots.txt` 和 `sitemap.xml` 返回 200；不存在的路径返回 404，游戏页面响应包含 `X-Robots-Tag: noindex, follow`。
- 部署令牌 `calcsolver-github-pages-deploy` 为账号级 Pages Write，保存于 GitHub 的 `CLOUDFLARE_API_TOKEN` 加密 Secret；控制台显示到期日为 **2027-10-01**。到期前更新该 Secret，避免后续部署失败。

## 手动部署记录 · 2026-09-30 视觉改版

- 纸白、石墨黑与明黄的视觉新版已发布到 [calcsolver.info](https://calcsolver.info/)，备用地址为 [calcsolver-info.pages.dev](https://calcsolver-info.pages.dev/)。
- Pages 项目：`calcsolver-info`，采用 Direct Upload；55 个文件均上传成功。
- 该次手动生产部署：`991840f3-fd09-4bcc-a24b-9e609954c1d3`，环境为 Production，生产分支为 `main`。
- 发布源码为已推送的视觉提交 `79e18036e236ee85348ff23079b109e944753bdd`。从该提交的独立快照构建，通过 Cloudflare 控制台上传；工作区中尚未提交的 SEO 修改未包含在本次发布中。
- 发布前 `npm run verify` 通过：Astro 检查无错误或警告、28 项测试通过、41 个 HTML 页面、720 个本地链接和 38 个 sitemap URL 检查通过。
- 正式域名计算 `2+3*4` 得到 `14`；375px 手机布局没有水平溢出，浏览器没有错误或警告日志。
- 正式域名加载的 `/_astro/Base.DXDX2RVL.css` 与本次构建的 SHA-256 完全一致，主题色为 `#f7f7f2`。首页、示例文章、`robots.txt`、`sitemap.xml` 和备用域名均返回 200。
- Cloudflare 控制台已显示 `calcsolver.info` DNS 区域为 Active。已在本项目添加正式域名，确认将根域 A 记录更新为代理 CNAME：`calcsolver.info` → `calcsolver-info.pages.dev`。
- Pages 自定义域名已显示 Active 与 SSL enabled。正式域名首页、`robots.txt` 和 `sitemap.xml` 均返回 200；浏览器计算 `2+3*4` 得到 `14`，页面加载的最终样式文件与本地构建一致。

本域名由 Cloudflare 分配的名称服务器为：

```text
eric.ns.cloudflare.com
shubhi.ns.cloudflare.com
```

本域名的名称服务器、Pages 绑定与 HTTPS 激活均已完成验收。当前仅绑定根域；`www` 不是本次已配置的自定义域名。

Build and verify before uploading:

```sh
npm ci
npm run verify
```

The static site is in `dist/`. Keep the project source and lockfile in version control; do not publish `.env` or `node_modules`.

## Cloudflare Pages

这是本项目已选定的部署平台。源码位于 [GitHub 仓库](https://github.com/fang20030527/calcsolver)的 `main` 分支。现有 Pages 项目采用 Direct Upload，使用 GitHub Actions 与 Wrangler 上传构建结果即可自动部署，无需更换项目或域名。[Cloudflare 官方 CI 说明](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)

### 自动部署

工作流位于 [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)，每次推送到 `main` 时运行，也支持从 GitHub Actions 手动触发。发布顺序为 Node 24 → `npm ci` → `npm run verify` → 上传 `dist/` 到 `calcsolver-info` 的生产分支 `main`。检查失败时不会上传。生产部署按顺序执行，避免并行上传覆盖。

在 GitHub 仓库 Settings → Secrets and variables → Actions 中设置：

- Repository variable `CLOUDFLARE_ACCOUNT_ID`：`e4efddba8ed58e7be7a8ee4fb831b40d`。
- Repository secret `CLOUDFLARE_API_TOKEN`：部署专用 Cloudflare API 令牌，仅授予本账号的 Cloudflare Pages Edit 权限。该权限覆盖账号内 Pages 项目；不要添加 DNS、Workers 或账单权限。

令牌只保存在 GitHub 加密 Secret 中，不写入源码、`.env` 或构建包。令牌到期或撤销后，需要更新同名 Secret。`GITHUB_TOKEN` 由 Actions 自动提供，仅用于记录 GitHub deployment。

运行结果与日志见 [GitHub Actions](https://github.com/fang20030527/calcsolver/actions/workflows/deploy.yml)。成功后检查正式域名的首页 H1 含 `CalcSolver`，并检查 canonical、JSON-LD、`robots.txt` 和 `sitemap.xml`。

### 手动上传备用方式

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
