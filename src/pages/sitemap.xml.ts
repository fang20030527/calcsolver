import { articles } from '../data/articles';
import { site, categories } from '../data/site';
export function GET() {
  const paths = ['/', '/about/', '/contact/', '/privacy/', ...categories.map(category=>`/category/${category.slug}/`), ...articles.map(article=>`/${article.slug}/`)];
  const content = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path=>`<url><loc>${site.url}${path}</loc></url>`).join('')}</urlset>`;
  return new Response(content,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
