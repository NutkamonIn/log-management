import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function Logs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const fetchLogs = async (searchQuery = '') => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/v1/search?q=${searchQuery}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        }
        setIsLoading(false);
    };

    // โหลดข้อมูลครั้งแรกตอนเปิดหน้าเว็บ
    useEffect(() => {
        fetchLogs();
    }, []);

    // สั่งค้นหาเมื่อผู้ใช้กดปุ่ม Enter ในช่องค้นหา
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            fetchLogs(query);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Logs Explorer</h1>
                    <p className="text-slate-500 text-sm mt-1">Search and filter your raw logs</p>
                </div>

                {/* ช่องค้นหา (Search Box) */}
                <div className="relative mb-6 shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3"
                        placeholder="ค้นหา Log (เช่น 192.168.1.100 หรือ login_failed) แล้วกด Enter..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>

                {/* ตารางแสดงผล Log */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-4 w-10"></th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Source IP</th>
                                    <th className="px-6 py-4">Event Type</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-4 text-center">No logs found.</td></tr>
                                ) : (
                                    logs.map((log: any, idx: number) => (
                                        <React.Fragment key={idx}>
                                            <tr 
                                                className="bg-white border-b hover:bg-slate-50 cursor-pointer"
                                                onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                                            >
                                                <td className="px-4 py-4 text-slate-400">
                                                    {expandedRow === idx ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                    {new Date(log._source['@timestamp']).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">{log._source.src_ip || '-'}</td>
                                                <td className="px-6 py-4">{log._source.event_type || '-'}</td>
                                                <td className="px-6 py-4">{log._source.action || '-'}</td>
                                                <td className="px-6 py-4 truncate max-w-md">{log._source.msg || '-'}</td>
                                            </tr>
                                            {expandedRow === idx && (
                                                <tr className="bg-slate-50 border-b">
                                                    <td colSpan={6} className="px-6 py-4">
                                                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                                            <pre className="text-xs text-green-400 font-mono">
                                                                {JSON.stringify(log._source, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
