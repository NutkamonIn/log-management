

interface SeverityBadgeProps {
    severity: string | number;
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
    const sevString = String(severity).toLowerCase();

    let colorClass = 'bg-slate-100 text-slate-600';
    let label = sevString;

    if (sevString === 'critical' || sevString === '5') {
        colorClass = 'bg-red-100 text-red-700 border-red-200';
        label = 'Critical';
    } else if (sevString === 'high' || sevString === '4') {
        colorClass = 'bg-orange-100 text-orange-700 border-orange-200';
        label = 'High';
    } else if (sevString === 'medium' || sevString === '3') {
        colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
        label = 'Medium';
    } else if (sevString === 'low' || sevString === '2') {
        colorClass = 'bg-blue-100 text-blue-700 border-blue-200';
        label = 'Low';
    } else if (sevString === 'info' || sevString === '1') {
        colorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
        label = 'Info';
    } else if (!severity || sevString === 'undefined' || sevString === 'null') {
        label = 'N/A';
        colorClass = 'bg-slate-100 text-slate-500 border-slate-200';
    }

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} uppercase tracking-wider`}>
            {label}
        </span>
    );
}
