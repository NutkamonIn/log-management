import React from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: 'blue' | 'indigo' | 'slate';
}

export default function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
    const colorMap = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        slate: 'text-slate-600 bg-slate-50 border-slate-200',
    };

    return (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg border ${colorMap[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            </div>
        </div>
    );
}
