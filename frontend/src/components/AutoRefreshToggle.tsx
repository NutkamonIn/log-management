

interface AutoRefreshToggleProps {
    isOn: boolean;
    onToggle: (state: boolean) => void;
}

export default function AutoRefreshToggle({ isOn, onToggle }: AutoRefreshToggleProps) {
    return (
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
             onClick={() => onToggle(!isOn)}>
            <span className="text-sm font-medium text-slate-700">Auto-refresh</span>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out ${isOn ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ease-in-out ${isOn ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
        </div>
    );
}
