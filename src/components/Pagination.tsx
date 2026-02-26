interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showGoToPage?: boolean;
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8.5 3.5L5 7L8.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5.5 3.5L9 7L5.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showGoToPage = false,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [];

    if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages - 1, totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, 2, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between py-3">
      {/* Left: Info text */}
      <span className="text-xs text-[#7a7a83]">
        Showing {startItem} - <span className="font-medium text-[#f9f9fa]">{endItem}</span> of {totalItems} items. Page {currentPage} of {totalPages}
      </span>

      {/* Right: Page buttons */}
      <div className="flex items-center gap-1">
        {/* Prev button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex size-7 items-center justify-center rounded-[6px] text-[#7a7a83] transition-colors hover:text-[#f9f9fa] disabled:opacity-30"
        >
          <ChevronLeftIcon />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, i) =>
          page === '...' ? (
            <span key={`dots-${i}`} className="flex size-7 items-center justify-center text-xs text-[#7a7a83]">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex size-7 items-center justify-center rounded-[6px] text-xs font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[rgba(22,194,132,0.2)] text-[#5bd197]'
                  : 'text-[#7a7a83] hover:text-[#f9f9fa]'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex size-7 items-center justify-center rounded-[6px] text-[#7a7a83] transition-colors hover:text-[#f9f9fa] disabled:opacity-30"
        >
          <ChevronRightIcon />
        </button>

        {/* Go to page */}
        {showGoToPage && (
          <>
            <div className="mx-2 h-4 w-px bg-[#252527]" />
            <span className="text-xs text-[#7a7a83] mr-1">Go to page</span>
            <select
              value={currentPage}
              onChange={(e) => onPageChange(Number(e.target.value))}
              className="h-7 rounded-[6px] border border-[#252527] bg-[#1b1b1c] px-2 text-xs text-[#f9f9fa] outline-none"
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
}
