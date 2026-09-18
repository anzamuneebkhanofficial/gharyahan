/**
 * Shared Pagination component
 * Used by: dashboard/page.jsx, admin/page.jsx, search/page.jsx
 */
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * @param {object} props
 * @param {number} props.page - current page (1-indexed)
 * @param {number} props.total - total number of items
 * @param {number} props.pageSize - items per page
 * @param {(page: number) => void} props.onPageChange
 * @param {boolean} [props.showCount=true] - show "Showing X–Y of Z" label
 */
export default function Pagination({ page, total, pageSize, onPageChange, showCount = true }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  // Build page numbers with ellipsis for large sets
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
      {showCount ? (
        <span className="text-xs text-muted">
          Showing <strong className="font-semibold text-foreground">{start}–{end}</strong> of{" "}
          <strong className="font-semibold text-foreground">{total}</strong>
        </span>
      ) : (
        <span className="text-xs text-muted">
          Page {page} of {totalPages}
        </span>
      )}

      <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border border-border text-secondary hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Previous
        </button>

        {getPageNumbers().map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-subtle text-xs select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`h-8 w-8 flex items-center justify-center text-xs font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                p === page
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-background border border-transparent"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border border-border text-secondary hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
