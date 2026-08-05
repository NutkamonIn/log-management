import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import SeverityBadge from '../components/SeverityBadge';
import AutoRefreshToggle from '../components/AutoRefreshToggle';

interface AlertLog {
    "@timestamp": string;
    tenant: string;
    source: string;
    event_type: string;
    severity: number;
    action: string;
    src_ip: string;
    msg: string;
}

export default function Alerts() {
    const [alerts, setAlerts] = useState<AlertLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchAlerts = async (isBackground = false) => {
        if (!isBackground) setIsLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get('/api/v1/alerts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(res.data.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        } finally {
            if (!isBackground) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchAlerts(true);
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Security Alerts</h1>
                            <p className="text-slate-500 text-sm mt-1">Monitor brute-force attacks and suspicious activities</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {lastUpdated && (
                            <div className="flex items-center text-xs text-slate-400 font-medium">
                                <Clock className="w-3 h-3 mr-1" />
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </div>
                        )}
                        <AutoRefreshToggle isOn={autoRefresh} onToggle={setAutoRefresh} />
                        <button
                            onClick={() => fetchAlerts()}
                            className="p-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 bg-white shadow-sm flex items-center justify-center h-10 w-10 transition-colors"
                            title="Refresh Data"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                        <h2 className="font-semibold text-slate-800">Alert History</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500 flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            Loading alerts...
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="p-10 text-center text-slate-500 flex flex-col items-center">
                            <ShieldAlert className="w-12 h-12 text-slate-300 mb-3" />
                            <p>No security alerts found.</p>
                            <p className="text-sm">Your system is currently safe.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Timestamp</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Severity</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Source IP</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Message</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {alerts.map((alert, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {new Date(alert["@timestamp"]).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <SeverityBadge severity={alert.severity} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700">
                                                {alert.src_ip}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">
                                                {alert.msg}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
