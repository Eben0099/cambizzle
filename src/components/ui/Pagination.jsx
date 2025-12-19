import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Button from './Button';

const Pagination = ({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  className = ''
}) => {
  const generatePageNumbers = () => {
    const pages = [];
    const delta = 2; // Number of pages around the current page

    // Always show the first page
    if (1 < currentPage - delta) {
      pages.push(1);
      if (2 < currentPage - delta) {
        pages.push('...');
      }
    }

    // Pages around the current page
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }

    // Always show the last page
    if (totalPages > currentPage + delta) {
      if (totalPages - 1 > currentPage + delta) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = generatePageNumbers();

  return (
    <nav
      className={`flex items-center justify-center py-6 `}
      aria-label="Pagination"
    >
      {/* Mobile View */}
      <div className="flex justify-center space-x-4 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-[#D6BA69]/10 hover:border-[#D6BA69] hover:text-[#D6BA69] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-[#D6BA69]/10 hover:border-[#D6BA69] hover:text-[#D6BA69] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
          aria-label="Next page"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex sm:flex-col sm:items-center sm:gap-4">
        <div className="flex items-center space-x-1">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
            className="inline-flex items-center px-3 py-2 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-[#D6BA69]/10 hover:border-[#D6BA69] hover:text-[#D6BA69] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Page Numbers */}
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </span>
              );
            }

            return (
              <Button
                key={page}
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  page === currentPage
                    ? 'bg-[#D6BA69] border-[#D6BA69] text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-[#D6BA69]/10 hover:border-[#D6BA69] hover:text-[#D6BA69]'
                } focus:outline-none focus:ring-2 focus:ring-[#D6BA69]`}
                aria-label={`Page ${page}`}
              >
                {page}
              </Button>
            );
          })}

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className="inline-flex items-center px-3 py-2 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-[#D6BA69]/10 hover:border-[#D6BA69] hover:text-[#D6BA69] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div>
          <p className="text-sm text-gray-600 font-medium">
            Page <span className="font-semibold text-[#D6BA69]">{currentPage}</span> of{' '}
            <span className="font-semibold text-[#D6BA69]">{totalPages}</span>
          </p>
        </div>
      </div>
    </nav>
  );
};

export default Pagination;