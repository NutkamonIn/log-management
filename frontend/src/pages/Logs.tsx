import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, ChevronRight, ChevronDown, Calendar, RefreshCw, List, AlignLeft, Filter, X } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from 'recharts';
import Sidebar from '../components/Sidebar';

export default function Logs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [histogramData, setHistogramData] = useState<any[]>([]);
    
    const [fieldFilter, setFieldFilter] = useState('');
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [timeRange, setTimeRange] = useState('15m');
    const [availableFields, setAvailableFields] = useState<{name: string, type: string}[]>([]);

    const fetchLogs = async (searchQuery = '') => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/v1/search?q=${searchQuery}&timeRange=${timeRange}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data.data || [];
            setLogs(data);
            
            // Extract dynamic fields from logs
            const fieldsSet = new Set<string>();
            const fieldTypes: Record<string, string> = {};
            data.forEach((log: any) => {
                Object.entries(log._source).forEach(([key, value]) => {
                    fieldsSet.add(key);
                    if (!fieldTypes[key]) {
                        if (typeof value === 'number') fieldTypes[key] = 'number';
                        else if (typeof value === 'string' && value.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) fieldTypes[key] = 'ip';
                        else fieldTypes[key] = 'string';
                    }
                });
            });
            const dynamicFields = Array.from(fieldsSet).map(name => ({
                name,
                type: fieldTypes[name] || 'string'
            })).sort((a, b) => a.name.localeCompare(b.name));
            setAvailableFields(dynamicFields);
            
            if (data.length > 0) {
                const buckets: Record<string, number> = {};
                data.forEach((log: any) => {
                    const date = new Date(log._source['@timestamp']);
                    const minuteKey = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
                    buckets[minuteKey] = (buckets[minuteKey] || 0) + 1;
                });
                
                const sortedKeys = Object.keys(buckets).sort();
                const realData = sortedKeys.map(k => ({
                    time: k,
                    count: buckets[k]
                }));
                
                setHistogramData(realData);
            } else {
                setHistogramData([]);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, [timeRange]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') fetchLogs(query);
    };

    const toggleField = (fieldName: string) => {
        if (selectedFields.includes(fieldName)) {
            setSelectedFields(selectedFields.filter(f => f !== fieldName));
        } else {
            setSelectedFields([...selectedFields, fieldName]);
        }
    };

    const filteredFields = availableFields.filter(f => f.name.toLowerCase().includes(fieldFilter.toLowerCase()));

    return (
        <div className="flex flex-col md:flex-row h-screen bg-white font-sans overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="h-16 border-b border-slate-200 bg-white flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
                    <div className="flex-1 flex items-center max-w-4xl relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-l-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 outline-none"
                            placeholder="Search... (e.g. status:404 OR src_ip:192.168.1.50)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <button 
                            onClick={() => fetchLogs(query)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-medium rounded-r-md transition-colors border border-blue-600"
                        >
                            Update
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                        <select 
                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="15m">Last 15 minutes</option>
                            <option value="1h">Last 1 hour</option>
                            <option value="24h">Last 24 hours</option>
                            <option value="7d">Last 7 days</option>
                        </select>
                        <button 
                            onClick={() => fetchLogs(query)}
                            className="p-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 bg-white"
                        >
                            <RefreshCw className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden bg-white">
                    <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
                        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-100/50">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Available Fields</span>
                            <Filter className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="relative mb-3">
                                <Search className="w-4 h-4 absolute left-2 top-2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Filter fields..." 
                                    value={fieldFilter}
                                    onChange={(e) => setFieldFilter(e.target.value)}
                                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded bg-white outline-none" 
                                />
                            </div>
                            
                            {selectedFields.length > 0 && (
                                <div className="mb-4">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 px-2">Selected Fields</div>
                                    <ul className="space-y-1 mb-2">
                                        {selectedFields.map((fieldName, idx) => (
                                            <li key={idx} className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-800 bg-blue-50 border border-blue-100 rounded group">
                                                <span className="truncate flex-1 font-medium">{fieldName}</span>
                                                <button onClick={() => toggleField(fieldName)} className="text-slate-400 hover:text-red-500">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="border-b border-slate-200 my-2"></div>
                                </div>
                            )}

                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 px-2">All Fields</div>
                            <ul className="space-y-1">
                                {filteredFields.map((field, idx) => {
                                    const isSelected = selectedFields.includes(field.name);
                                    if (isSelected) return null;
                                    return (
                                        <li key={idx} className="flex items-center px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-200/50 rounded cursor-pointer group">
                                            <span className={`w-3 h-3 flex items-center justify-center rounded text-[8px] font-bold mr-2 ${field.type === 'string' ? 'bg-blue-100 text-blue-600' : field.type === 'number' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                                {field.type === 'string' ? 't' : field.type === 'number' ? '#' : 'ip'}
                                            </span>
                                            <span className="truncate flex-1">{field.name}</span>
                                            <button 
                                                onClick={() => toggleField(field.name)}
                                                className="hidden group-hover:block text-[10px] bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded hover:bg-blue-500 hover:text-white"
                                            >
                                                Add
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden bg-white">
                        <div className="h-40 border-b border-slate-200 p-4 shrink-0 bg-white flex flex-col">
                            <div className="text-xs font-semibold text-slate-600 mb-2 flex justify-between">
                                <span>Events over time</span>
                                <span className="text-slate-400 font-normal">{logs.length} hits</span>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                {histogramData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={histogramData}>
                                            <XAxis dataKey="time" hide />
                                            <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{fontSize: '12px'}} />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={40} isAnimationActive={false} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">No data for chart</div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-white">
                            <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 flex text-xs font-semibold text-slate-700 shadow-sm">
                                <div className="w-10 px-2 py-2.5 flex justify-center items-center shrink-0 border-r border-slate-200"></div>
                                <div className="w-48 px-4 py-2.5 border-r border-slate-200 shrink-0 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1.5" /> Time
                                </div>
                                {selectedFields.length > 0 ? (
                                    selectedFields.map(field => (
                                        <div key={field} className="flex-1 px-4 py-2.5 border-r border-slate-200 flex items-center font-bold text-blue-600">
                                            {field}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex-1 px-4 py-2.5 flex items-center">
                                        <AlignLeft className="w-3 h-3 mr-1.5" /> _source
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-col">
                                {isLoading ? (
                                    <div className="p-8 text-center text-sm text-slate-500">Loading documents...</div>
                                ) : logs.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-500">No results match your search criteria</div>
                                ) : (
                                    logs.map((log: any, idx: number) => {
                                        const isExpanded = expandedRow === idx;
                                        return (
                                            <div key={idx} className="flex flex-col border-b border-slate-100 hover:bg-slate-50/50">
                                                <div 
                                                    className="flex cursor-pointer text-sm"
                                                    onClick={() => setExpandedRow(isExpanded ? null : idx)}
                                                >
                                                    <div className="w-10 px-2 py-2 flex justify-center items-start shrink-0 text-slate-400 mt-0.5">
                                                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </div>
                                                    <div className="w-48 px-4 py-2 shrink-0 text-slate-600 font-mono text-[13px] whitespace-nowrap">
                                                        {new Date(log._source['@timestamp']).toLocaleString()}
                                                    </div>
                                                    
                                                    {selectedFields.length > 0 ? (
                                                        selectedFields.map(field => (
                                                            <div key={field} className="flex-1 px-4 py-2 text-slate-800 font-mono text-[13px] truncate overflow-hidden">
                                                                {log._source[field] !== undefined ? String(log._source[field]) : '-'}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex-1 px-4 py-2 text-slate-800 font-mono text-[13px] truncate overflow-hidden">
                                                            <span className="text-slate-400 mr-2">{'{'}</span>
                                                            {Object.entries(log._source).filter(([k]) => k !== '@timestamp').slice(0, 5).map(([k, v], i) => (
                                                                <React.Fragment key={k}>
                                                                    <span className="text-blue-600 font-medium">"{k}"</span>: 
                                                                    <span className="text-slate-600 mx-1">{JSON.stringify(v)}</span>
                                                                    {i < 4 && <span className="text-slate-300 mr-1">,</span>}
                                                                </React.Fragment>
                                                            ))}
                                                            <span className="text-slate-400 ml-2">{'}'}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {isExpanded && (
                                                    <div className="pl-10 pr-4 py-4 bg-slate-50 border-t border-slate-100 flex flex-col space-y-4 shadow-inner">
                                                        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                                                            <div className="bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 border-b border-slate-200 flex items-center">
                                                                <List className="w-4 h-4 mr-2" /> Document Fields
                                                            </div>
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-left text-[13px]">
                                                                    <tbody>
                                                                        {Object.entries(log._source).map(([key, value], i) => (
                                                                            <tr key={key} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                                                <td className="px-4 py-2 w-1/4 font-medium text-slate-700 border-r border-slate-100">{key}</td>
                                                                                <td className="px-4 py-2 font-mono text-slate-600">{JSON.stringify(value)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="text-xs font-semibold text-slate-700 mb-1">JSON</div>
                                                            <div className="bg-slate-900 rounded-md p-4 overflow-x-auto">
                                                                <pre className="text-[13px] text-green-400 font-mono leading-relaxed">
                                                                    {JSON.stringify(log._source, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
