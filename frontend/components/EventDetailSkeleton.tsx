export default function EventDetailSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="h-4 bg-gray-200 rounded w-16 mb-6 animate-pulse"></div>
            <div className="bg-white rounded-xl shadow-sm p-8 animate-pulse">
                <div className="h-5 bg-gray-200 rounded-full w-20 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>

                <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>

                <div className="space-y-3 mb-8">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>

                <div className="space-y-3">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
}