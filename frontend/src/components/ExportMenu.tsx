import { useState, useRef, useEffect } from 'react';
import { Download, FileJson, FileText } from 'lucide-react';

interface ExportMenuProps {
    onExportJson: () => void;
    onExportCsv: () => void;
    disabled?: boolean;
}

export default function ExportMenu({ onExportJson, onExportCsv, disabled = false }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className="p-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 bg-white shadow-sm flex items-center justify-center h-10 w-10 transition-colors disabled:opacity-50"
                title="Export Data"
            >
                <Download className="w-4 h-4 text-slate-500" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-slate-100 py-1 z-50">
                    <button
                        onClick={() => {
                            onExportJson();
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                    >
                        <FileJson className="w-4 h-4 mr-2 text-yellow-500" /> JSON
                    </button>
                    <button
                        onClick={() => {
                            onExportCsv();
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                    >
                        <FileText className="w-4 h-4 mr-2 text-green-500" /> CSV
                    </button>
                </div>
            )}
        </div>
    );
}
