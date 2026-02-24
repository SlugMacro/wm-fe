import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 pt-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-[#7a7a83]">
                <ChevronRightIcon />
              </span>
            )}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="text-xs font-normal text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`text-xs font-normal ${isLast ? 'text-[#f9f9fa]' : 'text-[#7a7a83]'}`}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
