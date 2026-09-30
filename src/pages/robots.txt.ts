import { site } from '../data/site';
// Crawlers must be able to read the noindex metadata on the local game pages.
export function GET() { return new Response(`User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}}); }
