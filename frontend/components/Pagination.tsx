interface PaginationProps {
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, hasNextPage, hasPreviousPage, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={!hasPreviousPage}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 cursor-pointer"
            >
                Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={!hasNextPage}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 cursor-pointer"
            >
                Next
            </button>
        </div>
    );
}