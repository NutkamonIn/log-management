import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';

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

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/v1/alerts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAlerts(res.data.data);
            } catch (error) {
                console.error("Failed to fetch alerts", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="mb-8 flex items-center space-x-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Security Alerts</h1>
                        <p className="text-slate-500 text-sm mt-1">Monitor brute-force attacks and suspicious activities</p>
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
                                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span>High ({alert.severity})</span>
                                                </span>
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
