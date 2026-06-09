export default function RegistrationCardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
            </div>
        </div>
    );
}