import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, dirname, relative, sep } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('dist');
async function files(directory) {
  const entries = await readdir(directory,{withFileTypes:true});
  const groups = await Promise.all(entries.map(entry=>entry.isDirectory()?files(resolve(directory,entry.name)):[resolve(directory,entry.name)]));
  return groups.flat();
}
async function exists(path) { try { return (await stat(path)).isFile(); } catch { return false; } }
const htmlFiles = (await files(root)).filter(path=>path.endsWith('.html'));
assert.ok(htmlFiles.length>=41,`Expected at least 41 static pages, found ${htmlFiles.length}`);
let links=0;
const indexedUrls = new Set();
const titles = new Set();
const descriptions = new Set();
function decode(value) { return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'"); }
function meta(html, name) {
  const tag = Array.from(html.matchAll(/<meta\b[^>]*>/g), match => match[0]).find(tag => tag.includes(`name="${name}"`) || tag.includes(`property="${name}"`));
  return decode(tag?.match(/\bcontent="([^"]*)"/)?.[1] ?? '');
}
for(const path of htmlFiles) {
  const html = await readFile(path,'utf8');
  assert.ok(html.includes('https://calcsolver.info'),`Missing .info metadata: ${path}`);
  const outputPath = relative(root, path).split(sep).join('/');
  const pathname = outputPath === 'index.html' ? '/' : `/${outputPath.replace(/index\.html$/, '')}`;
  const canonical = decode(html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1] ?? '');
  if (outputPath === '404.html') assert.equal(canonical, '', 'Error pages must not advertise a canonical content URL.');
  else assert.equal(canonical, `https://calcsolver.info${pathname}`, `Incorrect canonical: ${path}`);
  assert.equal(Array.from(html.matchAll(/<h1\b/g)).length, 1, `Expected one H1: ${path}`);
  const title = decode(html.match(/<title>(.*?)<\/title>/)?.[1] ?? '');
  assert.ok(title && !titles.has(title), `Missing or duplicate title: ${path}`);
  titles.add(title);
  const description = meta(html, 'description');
  assert.ok(description, `Missing description: ${path}`);
  const noindex = /\bnoindex\b/.test(meta(html, 'robots'));
  if (!noindex) {
    assert.ok(!descriptions.has(description), `Duplicate indexed description: ${path}`);
    descriptions.add(description);
    indexedUrls.add(canonical);
    assert.equal(meta(html, 'og:url'), canonical, `Incorrect sharing URL: ${path}`);
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image', `Missing sharing card: ${path}`);
    assert.equal(meta(html, 'og:image'), 'https://calcsolver.info/og-image.png', `Incorrect sharing image: ${path}`);
    const json = html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)?.[1];
    assert.ok(json, `Missing JSON-LD: ${path}`);
    const schema = JSON.parse(json);
    assert.equal(schema['@context'], 'https://schema.org');
    const graph = schema['@graph'];
    assert.ok(Array.isArray(graph), `Missing schema graph: ${path}`);
    assert.equal(new Set(graph.map(node => node['@id'])).size, graph.length, `Duplicate schema IDs: ${path}`);
    const page = graph.find(node => node['@id'] === `${canonical}#webpage`);
    assert.equal(page?.url, canonical, `Schema URL mismatch: ${path}`);
    assert.equal(page?.description, description, `Schema description mismatch: ${path}`);
    const breadcrumb = graph.find(node => node['@type'] === 'BreadcrumbList');
    if (pathname !== '/') {
      assert.ok(breadcrumb?.itemListElement.length >= 2, `Missing breadcrumb schema: ${path}`);
      breadcrumb.itemListElement.forEach((item, index) => assert.equal(item.position, index + 1));
      assert.equal(breadcrumb.itemListElement.at(-1).item, canonical, `Breadcrumb does not end at current page: ${path}`);
    } else {
      const h1 = html.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
      assert.match(h1, /free online scientific calculator/i, 'Homepage H1 must contain its primary keyword');
      assert.match(h1, /\bCalcSolver\b/, 'Homepage H1 must contain the CalcSolver brand keyword');
      assert.ok(graph.some(node => node['@type'] === 'WebSite'), 'Missing website schema');
      assert.ok(graph.some(node => node['@type'] === 'WebApplication'), 'Missing calculator schema');
    }
    if (meta(html, 'og:type') === 'article') {
      const article = graph.find(node => node['@type'] === 'Article');
      assert.equal(article?.url, canonical, `Missing article schema: ${path}`);
      assert.ok(article?.headline && article?.author, `Missing article identity: ${path}`);
    }
  } else {
    assert.ok(outputPath === '404.html' || pathname.startsWith('/games/'), `Unexpected noindex page: ${path}`);
  }
  const hrefs = Array.from(html.matchAll(/\bhref="([^"\s]+)"/g),match=>match[1].replaceAll('&amp;','&'));
  for(const href of hrefs) {
    if(/^(https?:|mailto:|tel:|data:|#)/i.test(href)) continue;
    const local = href.split(/[?#]/)[0];
    if(!local) continue;
    const target = local.startsWith('/')?resolve(root,'.'+local):resolve(dirname(path),local);
    assert.ok(target===root || target.startsWith(root+'\\') || target.startsWith(root+'/'),`Link escapes output directory: ${href}`);
    const valid = await exists(target) || await exists(resolve(target,'index.html'));
    assert.ok(valid,`Broken local link ${href} in ${path}`);
    links++;
  }
}
const sitemap = await readFile(resolve(root,'sitemap.xml'),'utf8');
const urls = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g),match=>match[1]);
assert.equal(urls.length,38,'Sitemap must contain the homepage, 3 info pages, 3 categories and 31 articles.');
assert.deepEqual(new Set(urls), indexedUrls, 'Sitemap must include every indexable canonical page and exclude noindex pages.');
assert.equal(new Set(urls).size, urls.length, 'Sitemap must not contain duplicate URLs.');
for(const url of urls) {
  assert.equal(new URL(url).origin,'https://calcsolver.info');
  const target = resolve(root,'.'+new URL(url).pathname,'index.html');
  assert.ok(await exists(target),`Sitemap target missing: ${url}`);
}
const robots = await readFile(resolve(root,'robots.txt'),'utf8');
assert.ok(robots.includes('Sitemap: https://calcsolver.info/sitemap.xml'));
assert.ok(!/Disallow:\s*\/games\//i.test(robots), 'Crawlers must be able to read game noindex tags.');
const image = await readFile(resolve(root, 'og-image.png'));
assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Sharing image must be a real PNG.');
assert.equal(image.readUInt32BE(16), 1200);
assert.equal(image.readUInt32BE(20), 630);
process.stdout.write(`Build verified: ${htmlFiles.length} HTML pages, ${links} local links, ${urls.length} sitemap URLs.\n`);
process.stdout.write('SEO verified: unique metadata, one H1 per page, primary keyword, canonical URLs, JSON-LD, sharing image and sitemap/indexing parity.\n');
