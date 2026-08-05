import React, { useState } from 'react';
import axios from 'axios';
import { Search, Target, Clock, Activity, ShieldAlert, Crosshair, Users, Server, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { downloadAsJson, exportToCsv } from '../utils/export';
import ExportMenu from '../components/ExportMenu';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';

interface InvestigateProfile {
    total_events: number;
    first_seen: string | null;
    last_seen: string | null;
    top_events: { key: string; doc_count: number }[];
    related_ips: { key: string; doc_count: number }[];
    related_users: { key: string; doc_count: number }[];
    related_hosts: { key: string; doc_count: number }[];
    timeline: { key_as_string: string; doc_count: number }[];
    recent_logs: any[];
}

export default function Investigate() {
    const [entity, setEntity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<InvestigateProfile | null>(null);
    const [error, setError] = useState('');

    const fetchProfile = async (searchEntity: string) => {
        setIsLoading(true);
        setError('');
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get(`/api/v1/investigate?entity=${encodeURIComponent(searchEntity)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data.data);
        } catch (err: any) {
            console.error("Failed to investigate", err);
            setError(err.response?.data?.detail || 'Failed to fetch investigation data');
            setProfile(null);
        }
        setIsLoading(false);
    };

    React.useEffect(() => {
        fetchProfile('');
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        fetchProfile(entity.trim());
    };

    const handleExportCsv = () => {
        if (!profile) return;
        
        const data: any[] = [];
        
        // Summary
        data.push({ Section: 'Summary', Key: 'Total Occurrences', Value: profile.total_events });
        data.push({ Section: 'Summary', Key: 'First Seen', Value: profile.first_seen ? new Date(profile.first_seen).toLocaleString() : 'N/A' });
        data.push({ Section: 'Summary', Key: 'Last Seen', Value: profile.last_seen ? new Date(profile.last_seen).toLocaleString() : 'N/A' });
        
        // Related Users
        profile.related_users.forEach(e => {
            data.push({ Section: 'Related Users', Key: e.key, Value: e.doc_count });
        });
        
        // Related IPs
        profile.related_ips.forEach(e => {
            data.push({ Section: 'Related IPs', Key: e.key, Value: e.doc_count });
        });
        
        // Related Hosts
        profile.related_hosts.forEach(e => {
            data.push({ Section: 'Related Hosts', Key: e.key, Value: e.doc_count });
        });
        
        // Top Events
        profile.top_events.forEach(e => {
            data.push({ Section: 'Top Events', Key: e.key, Value: e.doc_count });
        });
        

        
        // Threat Events
        if (profile.recent_logs && profile.recent_logs.length > 0) {
            profile.recent_logs.forEach((log: any) => {
                const src = log._source || log;
                data.push({ 
                    Section: 'Threat Events', 
                    Timestamp: src['@timestamp'] ? new Date(src['@timestamp']).toLocaleString() : '',
                    Severity: src.severity || '',
                    'Event Type': src.event_type || '',
                    'Message / Details': src.message || JSON.stringify(src)
                });
            });
        }
        
        exportToCsv(data, `investigate_${entity}_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                        <Target className="w-6 h-6 mr-2 text-indigo-600" /> Threat Investigation
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Search for an IP address, Username, Hostname, or File Hash to build a threat profile.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Search className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="bg-slate-50 border border-slate-300 text-slate-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 p-3 outline-none transition-colors"
                                placeholder="Enter entity to investigate (e.g. 203.0.113.77, bob@demo.local)"
                                value={entity}
                                onChange={(e) => setEntity(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center shadow-sm disabled:opacity-70"
                        >
                            {isLoading ? 'Investigating...' : 'Investigate'}
                        </button>
                        <ExportMenu 
                            onExportJson={() => {
                                if (profile) downloadAsJson(profile, `investigate_${entity || 'default'}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
                            }}
                            onExportCsv={handleExportCsv}
                            disabled={!profile}
                        />
                    </form>
                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                </div>

                {profile && (
                    <div className="space-y-6">
                        {/* Profile Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                title="Total Occurrences"
                                value={profile.total_events}
                                icon={<Crosshair className="w-5 h-5" />}
                                color="indigo"
                            />
                            <StatCard
                                title="First Seen"
                                value={profile.first_seen ? new Date(profile.first_seen).toLocaleString() : 'N/A'}
                                icon={<Clock className="w-5 h-5" />}
                                color="slate"
                            />
                            <StatCard
                                title="Last Seen"
                                value={profile.last_seen ? new Date(profile.last_seen).toLocaleString() : 'N/A'}
                                icon={<Activity className="w-5 h-5" />}
                                color="slate"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Related Users */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
                                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center uppercase tracking-wider">
                                    <Users className="w-4 h-4 mr-2 text-blue-500" /> Related Users
                                </h3>
                                {profile.related_users.length > 0 ? (
                                    <ul className="space-y-3">
                                        {profile.related_users.map((u, i) => (
                                            <li key={i} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0">
                                                <span className="font-mono text-slate-700 truncate">{u.key}</span>
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{u.doc_count}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-sm text-slate-400">No related users found.</div>
                                )}
                            </div>

                            {/* Related IPs */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
                                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center uppercase tracking-wider">
                                    <ShieldAlert className="w-4 h-4 mr-2 text-red-500" /> Related IPs
                                </h3>
                                {profile.related_ips.length > 0 ? (
                                    <ul className="space-y-3">
                                        {profile.related_ips.map((ip, i) => (
                                            <li key={i} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0">
                                                <span className="font-mono text-slate-700 truncate">{ip.key}</span>
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{ip.doc_count}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-sm text-slate-400">No related IPs found.</div>
                                )}
                            </div>

                            {/* Related Hosts */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
                                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center uppercase tracking-wider">
                                    <Server className="w-4 h-4 mr-2 text-green-500" /> Related Hosts
                                </h3>
                                {profile.related_hosts.length > 0 ? (
                                    <ul className="space-y-3">
                                        {profile.related_hosts.map((host, i) => (
                                            <li key={i} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0">
                                                <span className="font-mono text-slate-700 truncate">{host.key}</span>
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{host.doc_count}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-sm text-slate-400">No related hosts found.</div>
                                )}
                            </div>
                        </div>

                        {/* Top Events Chart */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 mb-6">Top Event Types for Entity</h3>
                            <div className="h-64 w-full">
                                {profile.top_events.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={profile.top_events} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="key" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px' }} />
                                            <Bar dataKey="doc_count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">No events data available</div>
                                )}
                            </div>
                        </div>

                        {/* Timeline Chart */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-12">
                            <h3 className="text-lg font-semibold text-slate-800 mb-6">Activity Timeline</h3>
                            <div className="h-64 w-full">
                                {profile.timeline.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={profile.timeline}>
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
                                            <RechartsTooltip 
                                                cursor={{ fill: '#f8fafc' }} 
                                                contentStyle={{ borderRadius: '8px' }}
                                                labelFormatter={(label) => new Date(label as string).toLocaleString()}
                                            />
                                            <Bar dataKey="doc_count" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">No timeline data available</div>
                                )}
                            </div>
                        </div>
                        
                        {/* High Severity Events Table */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-12">
                            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                                Threat Events (Sorted by Severity)
                            </h3>
                            {profile.recent_logs && profile.recent_logs.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                                        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3 text-left w-48">Timestamp</th>
                                                <th className="px-4 py-3 text-left w-24">Severity</th>
                                                <th className="px-4 py-3 text-left w-48">Event Type</th>
                                                <th className="px-4 py-3 text-left">Message / Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {profile.recent_logs.map((log: any, i: number) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 text-slate-500 font-mono text-[12px] whitespace-nowrap">
                                                        {new Date(log['@timestamp']).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <SeverityBadge severity={log.severity} />
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700 font-medium">
                                                        {log.event_type || log.rule_name || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 font-mono text-[13px] truncate max-w-md">
                                                        {log.message || log.description || JSON.stringify(log)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-100">
                                    <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No severe events found for this entity.</p>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
