import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * @param {{ items: Array<{ label: string, href?: string }> }} props
 */
export default function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.href || undefined,
    })),
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={i} className="flex items-center gap-1">
                {isLast ? (
                  <span className="font-medium text-slate-800 line-clamp-1" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <>
                    <Link
                      to={item.href || '/'}
                      className="hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.label}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
