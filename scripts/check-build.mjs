import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
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
for(const path of htmlFiles) {
  const html = await readFile(path,'utf8');
  assert.ok(html.includes('https://calcsolver.info'),`Missing .info metadata: ${path}`);
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
for(const url of urls) {
  assert.equal(new URL(url).origin,'https://calcsolver.info');
  const target = resolve(root,'.'+new URL(url).pathname,'index.html');
  assert.ok(await exists(target),`Sitemap target missing: ${url}`);
}
const robots = await readFile(resolve(root,'robots.txt'),'utf8');
assert.ok(robots.includes('Sitemap: https://calcsolver.info/sitemap.xml'));
process.stdout.write(`Build verified: ${htmlFiles.length} HTML pages, ${links} local links, ${urls.length} sitemap URLs.\n`);
