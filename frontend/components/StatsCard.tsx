import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    color?: string;
}

export default function StatsCard({ label, value, icon: Icon, color = 'text-blue-600' }: StatsCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-gray-50 ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                </div>
            </div>
        </div>
    );
}
