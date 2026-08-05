import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, Users } from 'lucide-react';
import { downloadAsJson, exportToCsv } from '../utils/export';
import ExportMenu from '../components/ExportMenu';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import TimeRangePicker from '../components/TimeRangePicker';
import type { TimeRangeValue } from '../components/TimeRangePicker';
import AutoRefreshToggle from '../components/AutoRefreshToggle';


interface DashboardStats {
    total_events: number;
    top_ips: { key: string; doc_count: number }[];
    top_events: { key: string; doc_count: number }[];
    top_users: { key: string; doc_count: number }[];
    timeline: { key_as_string: string; doc_count: number }[];
    recent_alerts: any[];
}

const getInitialTenant = () => {
    const token = sessionStorage.getItem('token');
    if (!token) return 'all';
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.tenant || 'all';
    } catch {
        return 'all';
    }
};

export default function Dashboard() {
    const userTenant = getInitialTenant();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRangeValue>({ type: 'quick', value: '24h' });
    const [tenantFilter, setTenantFilter] = useState(userTenant === 'all' ? 'all' : userTenant);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchStats = async () => {
        try {
            const token = sessionStorage.getItem('token');
            let url = `/api/v1/dashboard/stats?tenant=${tenantFilter}`;
            if (timeRange.type === 'quick') {
                url += `&timeRange=${timeRange.value}`;
            } else if (timeRange.type === 'custom' && timeRange.startTime && timeRange.endTime) {
                url += `&startTime=${timeRange.startTime}&endTime=${timeRange.endTime}`;
            }

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [timeRange, tenantFilter]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchStats();
            }, 5000); // 5 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, timeRange, tenantFilter]);

    const handleExportCsv = () => {
        if (!stats) return;
        const data = [
            { Metric: 'Total Events', Value: stats.total_events },
            ...stats.top_events.map(e => ({ Metric: `Top Event: ${e.key}`, Value: e.doc_count })),
            ...stats.top_ips.map(e => ({ Metric: `Top IP: ${e.key}`, Value: e.doc_count })),
            ...stats.top_users.map(e => ({ Metric: `Top User: ${e.key}`, Value: e.doc_count }))
        ];
        exportToCsv(data, `dashboard_stats_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">System Overview</h1>
                        <p className="text-slate-500 text-sm mt-1">Analytics and summaries of your log data</p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mt-4 md:mt-0 items-center">
                        {lastUpdated && (
                            <span className="text-xs text-slate-400 font-medium mr-2">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                        <select
                            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
                            value={tenantFilter}
                            onChange={(e) => setTenantFilter(e.target.value)}
                            disabled={userTenant !== 'all'}
                        >
                            {userTenant === 'all' ? (
                                <>
                                    <option value="all">All Tenants</option>
                                    <option value="demoA">Tenant: demoA</option>
                                    <option value="demoB">Tenant: demoB</option>
                                </>
                            ) : (
                                <option value={userTenant}>Tenant: {userTenant}</option>
                            )}
                        </select>
                        
                        <TimeRangePicker onChange={(range) => setTimeRange(range)} />
                        
                        <AutoRefreshToggle isOn={autoRefresh} onToggle={setAutoRefresh} />

                        <button
                            onClick={() => fetchStats()}
                            className="p-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 bg-white shadow-sm flex items-center justify-center h-10 w-10 transition-colors"
                            title="Refresh Data"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                <path d="M3 3v5h5"></path>
                            </svg>
                        </button>

                        <ExportMenu 
                            onExportJson={() => {
                                if (stats) downloadAsJson(stats, `dashboard_stats_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
                            }}
                            onExportCsv={handleExportCsv}
                            disabled={!stats}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Total Events"
                        value={stats ? stats.total_events : '...'}
                        icon={<Activity className="w-5 h-5" />}
                        color="blue"
                    />
                    <StatCard
                        title="Top Event Type"
                        value={stats?.top_events[0]?.key || '-'}
                        icon={<Users className="w-5 h-5" />}
                        color="indigo"
                    />
                    <StatCard
                        title="Top Suspicious IP"
                        value={stats?.top_ips[0]?.key || '-'}
                        icon={<ShieldAlert className="w-5 h-5" />}
                        color="slate"
                    />
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Timeline Chart */}
                    <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6">Event Timeline</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.timeline || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="key_as_string"
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => {
                                            const d = new Date(val);
                                            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')} ${d.getHours()}:00`;
                                        }}
                                    />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelFormatter={(label) => new Date(label as string).toLocaleString()}
                                    />
                                    <Bar dataKey="doc_count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Event Types Chart */}
                    <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6">Top 5 Event Types</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.top_events || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="key" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="doc_count" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top IP Chart */}
                    <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6">Top 5 Source IPs</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.top_ips || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="key" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="doc_count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Users Chart */}
                    <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6">Top 5 Users</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.top_users || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="key" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="doc_count" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
