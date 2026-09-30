# SEO 优化记录 · 2026-09-30

本次针对现有 Astro 网站做增量修改。修改前线上检查时，首页返回 200，H1 为 `Make sense of the numbers.`，没有 JSON-LD；`robots.txt` 同时阻止了带 `noindex` 的游戏页面。以下改动已通过本地构建验收，并通过 [首次 GitHub Actions 自动部署](https://github.com/fang20030527/calcsolver/actions/runs/36681672429)发布到正式域名。

## 已完成的修改

| 观察与优先级 | 实施内容 | 验证与后续观察 |
| --- | --- | --- |
| 首页 H1 没有说明页面提供的工具（高） | H1 改为 **CalcSolver: Free online scientific calculator.**，同时包含品牌关键词 CalcSolver 和工具关键词；title、description 和介绍围绕在线科学计算器的真实功能编写。分数转换分类的 H1 改为 **Fraction to Decimal and Percent**。 | 构建检查要求首页包含 CalcSolver 和完整工具关键词，并保证所有页面只有一个 H1；发布后通过 Search Console 查看相关查询的展示和点击。 |
| 缺少机器可读的网站与内容身份（中） | 添加 WebSite、Organization、WebPage、WebApplication、Article、CollectionPage、ItemList 和 BreadcrumbList JSON-LD。作者链接指向已有 About 页面，面包屑和页面可见层级一致。 | 检查每个可索引页面的 JSON、canonical、描述和面包屑末级；发布后用 Rich Results Test 检查适用的 Article 和 BreadcrumbList。没有可核实的作者资历、发布日期、评分或评论，因此没有添加这些字段，也不承诺软件应用富结果。 |
| 部分文章标题偏长，分数摘要没有直接答案（中） | 缩短长标题的 SEO 版本；分数摘要加入实际数值，循环小数明确标注近似。每页的标题与描述保持唯一。 | 构建检查重复元数据；发布后观察 Google 实际显示的标题和摘要，Google 可能自行改写。 |
| 分类与文章之间的相关链接可以更清楚（中） | 分类增加独立的方法介绍和跨分类链接；相同分数的转换与等值文章优先互相推荐。 | 检查全部本地链接，保证 sitemap 覆盖全部 38 个可索引页面；通过 Search Console 的页面索引报告观察抓取发现情况。 |
| 游戏页的 robots.txt 屏蔽阻止爬虫读取 noindex（高） | 移除 `/games/` 的 Disallow；保留页面 `noindex, follow`，并在 Cloudflare `_headers` 增加 X-Robots-Tag。游戏继续排除在 sitemap 之外，404 使用 noindex 且不声明内容 canonical。 | 构建检查索引规则与 sitemap 一致；发布后 URL 检查应能抓取游戏页面并读到 noindex。依据：[Google noindex 文档](https://developers.google.com/search/docs/crawling-indexing/block-indexing)。 |
| 分享图使用 SVG，字体请求通过 CSS import 发现（中） | 添加 1200 × 630 PNG 分享图、完整 Open Graph 和 Twitter Card；字体改为 head 中的 stylesheet，并增加字体服务 preconnect，保留 display=swap。 | 检查 PNG 文件签名与尺寸；浏览器检查字体链接、首页布局和计算器功能。尚无真实用户 Core Web Vitals 数据，未声称 LCP、INP 或 CLS 分数提升。 |

## 验收

- `npm run verify`：Astro 检查 0 错误、0 警告；28 项行为测试通过；生产构建成功。
- 41 个 HTML 页面、761 个本地链接、38 个 sitemap URL 通过检查。
- 可索引页面的元数据唯一，JSON-LD 可解析，canonical 和分享 URL 一致。
- 375px 手机与 1365px 桌面布局没有水平溢出；首页包含完整主关键词，计算器 `2+3*4` 得到 `14`。
- 抽查 `1/3` 转换文章：近似数值说明、作者链接、面包屑和对应等值分数链接正常。
- 正式域名验证：首页 H1 为 `CalcSolver: Free online scientific calculator.`，canonical 与 PNG 分享图指向正式域名，四种首页 JSON-LD 类型可解析，计算器 `2+3*4` 得到 `14`；文章、分类、robots 和 sitemap 返回 200。

构建产物位于 `dist/`。推送到 `main` 后由 GitHub Actions 自动验证并发布；手动上传包仍可通过 `scripts/package-pages.ps1` 生成。部署方式见 [deployment.md](deployment.md)。

## 发布后的检查

1. 已确认正式域名首页 H1 为新关键词标题，且 `og-image.png`、`robots.txt`、`sitemap.xml` 返回 200；随机不存在的路径返回 404，游戏页面响应包含 `X-Robots-Tag: noindex, follow`。
2. 在域名所有者的 Google Search Console 中提交 `https://calcsolver.info/sitemap.xml`，抽查首页、分类与文章的 URL 检查结果。当前没有使用已验证的 Search Console 账户，也没有实际提交 sitemap 或请求收录。
3. 用 [Rich Results Test](https://search.google.com/test/rich-results) 验证发布后的文章与面包屑。结构化数据帮助理解页面，但不保证富结果、收录或排名。
4. 后续以 Search Console 的展示、点击、查询和页面索引报告为基线；有真实流量后再测量 Core Web Vitals。Contact 页仍需站长配置一个实际可用的支持邮箱。

本次保留现有页面 URL，没有创建新批量文章、添加未经核实的更新时间、配置多语言 hreflang 或更改域名绑定。

结构化数据参考：[网站名称](https://developers.google.com/search/docs/appearance/site-names)、[Article](https://developers.google.com/search/docs/appearance/structured-data/article)、[BreadcrumbList](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)。
