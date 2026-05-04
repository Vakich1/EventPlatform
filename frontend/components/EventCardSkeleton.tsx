export default function EventCardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded-full w-20 mb-3"></div>
            <div className="h-5 bg-gray-200 rounded mb-3 w-3/4"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
        </div>
    );
}