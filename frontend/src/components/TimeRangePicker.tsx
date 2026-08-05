import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronDown } from 'lucide-react';

export interface TimeRangeValue {
    type: 'quick' | 'custom';
    value: string; // e.g. '15m', '1h', or 'custom'
    startTime?: string; // ISO String
    endTime?: string;   // ISO String
}

interface TimeRangePickerProps {
    onChange: (range: TimeRangeValue) => void;
}

export default function TimeRangePicker({ onChange }: TimeRangePickerProps) {
    const [isQuickOpen, setIsQuickOpen] = useState(false);
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<'quick' | 'custom'>('quick');
    const [quickValue, setQuickValue] = useState('24h');
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // ปิด Popover ถ้าคลิกข้างนอก
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsQuickOpen(false);
                setIsCustomOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getQuickLabel = (val: string) => {
        switch (val) {
            case '15m': return 'Last 15 minutes';
            case '1h': return 'Last 1 hour';
            case '24h': return 'Last 24 hours';
            case '7d': return 'Last 7 days';
            default: return 'Custom Range';
        }
    };

    const handleQuickSelect = (val: string) => {
        setSelectedType('quick');
        setQuickValue(val);
        setIsQuickOpen(false);
        onChange({ type: 'quick', value: val });
    };

    const handleCustomApply = () => {
        if (!startDateTime || !endDateTime) return;
        
        const start = new Date(startDateTime).toISOString();
        const end = new Date(endDateTime).toISOString();

        setSelectedType('custom');
        setIsCustomOpen(false);
        onChange({ type: 'custom', value: 'custom', startTime: start, endTime: end });
    };

    const formatCustomDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    };

    const displayLabel = selectedType === 'quick' 
        ? getQuickLabel(quickValue) 
        : (startDateTime && endDateTime) ? `${formatCustomDate(startDateTime)} - ${formatCustomDate(endDateTime)}` : 'Custom Range';

    return (
        <div className="relative flex items-center gap-2" ref={wrapperRef}>
            {/* Quick Select Button */}
            <button
                onClick={() => { setIsQuickOpen(!isQuickOpen); setIsCustomOpen(false); }}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
            >
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{selectedType === 'quick' ? displayLabel : 'Time Range'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Custom Date Button */}
            <button
                onClick={() => { setIsCustomOpen(!isCustomOpen); setIsQuickOpen(false); }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border shadow-sm transition-colors ${
                    selectedType === 'custom' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
                title="Custom Date Range"
            >
                <Calendar className="w-4 h-4" />
                {selectedType === 'custom' && (
                    <span className="text-sm font-medium ml-1">{displayLabel}</span>
                )}
            </button>

            {/* Quick Select Popover */}
            {isQuickOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg z-50 overflow-hidden border border-slate-200">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center">
                        <Clock className="w-4 h-4 text-blue-500 mr-2" />
                        <h3 className="text-slate-700 text-sm font-semibold">Quick Select</h3>
                    </div>
                    <div className="p-3 space-y-1">
                        {['15m', '1h', '24h', '7d'].map((val) => (
                            <button
                                key={val}
                                onClick={() => handleQuickSelect(val)}
                                className={`w-full text-left py-2 px-3 text-sm rounded-md transition-colors ${
                                    selectedType === 'quick' && quickValue === val 
                                    ? 'bg-blue-50 text-blue-700 font-medium' 
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {getQuickLabel(val)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Date Popover */}
            {isCustomOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg z-50 overflow-hidden border border-slate-200">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center">
                        <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                        <h3 className="text-slate-700 text-sm font-semibold">Custom Range</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">From</label>
                            <input 
                                type="datetime-local" 
                                className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={startDateTime}
                                onChange={(e) => setStartDateTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">To</label>
                            <input 
                                type="datetime-local" 
                                className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={endDateTime}
                                onChange={(e) => setEndDateTime(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleCustomApply}
                            disabled={!startDateTime || !endDateTime}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors text-sm mt-2"
                        >
                            Apply Custom Range
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
