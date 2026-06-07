import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Calculate the range of items currently being displayed
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Simple logic to display up to 5 page numbers around the current page
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-[#1A1D27] border-t border-[#2A2D3E] rounded-b-xl">
      <div className="flex-1 flex justify-between sm:hidden mb-4 sm:mb-0">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-[#2A2D3E] text-sm font-medium rounded-md text-[#94A3B8] bg-[#0F1117] hover:bg-[#2A2D3E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 border border-[#2A2D3E] text-sm font-medium rounded-md text-[#94A3B8] bg-[#0F1117] hover:bg-[#2A2D3E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#94A3B8]">
            Showing <span className="font-medium text-white">{startItem}</span> to <span className="font-medium text-white">{endItem}</span> of{' '}
            <span className="font-medium text-white">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#2A2D3E] bg-[#0F1117] text-sm font-medium text-[#94A3B8] hover:bg-[#2A2D3E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {startPage > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className={`relative inline-flex items-center px-4 py-2 border border-[#2A2D3E] bg-[#0F1117] text-sm font-medium text-[#94A3B8] hover:bg-[#2A2D3E] transition-colors`}
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className="relative inline-flex items-center px-4 py-2 border border-[#2A2D3E] bg-[#0F1117] text-sm font-medium text-[#94A3B8]">
                    ...
                  </span>
                )}
              </>
            )}

            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border border-[#2A2D3E] text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'z-10 bg-[#3B82F6] border-[#3B82F6] text-white'
                    : 'bg-[#0F1117] text-[#94A3B8] hover:bg-[#2A2D3E]'
                }`}
              >
                {page}
              </button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className="relative inline-flex items-center px-4 py-2 border border-[#2A2D3E] bg-[#0F1117] text-sm font-medium text-[#94A3B8]">
                    ...
                  </span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className={`relative inline-flex items-center px-4 py-2 border border-[#2A2D3E] bg-[#0F1117] text-sm font-medium text-[#94A3B8] hover:bg-[#2A2D3E] transition-colors`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#2A2D3E] bg-[#0F1117] text-sm font-medium text-[#94A3B8] hover:bg-[#2A2D3E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
