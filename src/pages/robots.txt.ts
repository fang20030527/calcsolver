import { site } from '../data/site';
export function GET() { return new Response(`User-agent: *\nAllow: /\nDisallow: /games/\nSitemap: ${site.url}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}}); }
