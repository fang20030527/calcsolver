import { site } from '../data/site';

export type StructuredData = Record<string, unknown>;
export interface Breadcrumb { name: string; path: string }

export function canonicalUrl(path: string): string {
  const pathname = new URL(path, site.url).pathname;
  const normalized = pathname.endsWith('/') || /\.[a-z0-9]+$/i.test(pathname) ? pathname : `${pathname}/`;
  return new URL(normalized, site.url).href;
}

export function pageStructuredData(
  path: string,
  title: string,
  description: string,
  pageType: string,
  breadcrumbs: Breadcrumb[],
  extra: StructuredData[],
) {
  const canonical = canonicalUrl(path);
  const graph: StructuredData[] = [
    { '@type': 'Organization', '@id': `${site.url}/#organization`, name: site.name, url: `${site.url}/`, logo: `${site.url}/favicon.svg` },
    { '@type': 'WebSite', '@id': `${site.url}/#website`, name: site.name, alternateName: site.domain, url: `${site.url}/`, inLanguage: 'en', publisher: { '@id': `${site.url}/#organization` } },
    {
      '@type': pageType, '@id': `${canonical}#webpage`, url: canonical, name: title, description,
      inLanguage: 'en', isPartOf: { '@id': `${site.url}/#website` },
      ...(breadcrumbs.length > 1 ? { breadcrumb: { '@id': `${canonical}#breadcrumb` } } : {}),
    },
  ];
  if (breadcrumbs.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
      itemListElement: breadcrumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, name: crumb.name, item: canonicalUrl(crumb.path) })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': [...graph, ...extra] };
}

// JSON-LD is inserted as script text: prevent content from closing the script element.
export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
