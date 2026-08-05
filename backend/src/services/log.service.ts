import { osClient } from "../config/opensearch.js";
import { normalizeLog, CentralLogSchema } from "./parser.service.js";


// seve Log in OpenSearch
export const indexLogService = async (logData: CentralLogSchema, user: { role: string; tenant: string }) => {
    //Logic
    // Multi-tenant: ถ้าไม่ใช้ Admin บังคับเปลี่ยน Tenant ตามสิทธิ์ที่มี
    if (user.role !== 'admin') {
        logData.tenant = user.tenant
    }

    // แปลง log ผ่าน Parser
    const normalizedData = normalizeLog(logData);

    // แยก Index ตาม Tenant 
    const indexName = `log-${normalizedData.tenant.toLowerCase()}`;

    // บันทึกลง OpenSearch Database
    const response = await osClient.index({
        index: indexName,
        body: normalizedData,
        refresh: true // เพื่อที่จะหาเจอได้ทันที
    });

    return {
        id: response.body._id,
        index: indexName
    };
};

// Search Log
export const searchLogsService = async (user: { role: string; tenant: string }, q?: string, timeRange?: string, startTime?: string, endTime?: string) => {
    // role == admin ดึงทุก Index (logs-*) แต่ถ้าเป็น viewer ให้ดึง tenant ของตน
    const indexPattern = user.role === 'admin' ? 'log-*' : `log-${user.tenant.toLowerCase()}`;

    // กำหนดเวลา (Time Range)
    let timeFilter: any = { gte: "now-15m/m" };
    
    if (startTime && endTime) {
        timeFilter = { gte: startTime, lte: endTime };
    } else {
        if (timeRange === '15m') timeFilter = { gte: "now-15m/m" };
        else if (timeRange === '1h') timeFilter = { gte: "now-1h/m" };
        else if (timeRange === '24h') timeFilter = { gte: "now-24h/h" };
        else if (timeRange === '7d') timeFilter = { gte: "now-7d/d" };
    }

    const response = await osClient.search({
        index: indexPattern,
        body: {
            query: {
                bool: {
                    must: q ? [{ query_string: { query: q } }] : [{ match_all: {} }],
                    filter: [{ range: { "@timestamp": timeFilter } }]
                }
            },
            sort: [{ "@timestamp": { order: "desc" } }],
            size: 100
        }
    });

    return response.body.hits.hits;
};

//ดึง API สำหรับ Dashboard
// ดึง API สำหรับ Dashboard
export const getDashboardStatsService = async (user: { role: string; tenant: string }, queryParams: any) => {
    // กรอง index ตาม RBAC role: Admin -> log-* || Viewer -> log-tenant
    let indexPattern = user.role === 'admin' ? 'log-*' : `log-${user.tenant.toLowerCase()}`;

    // ถ้า Admin เลือก Filter เฉพาะเจาะจง tenant
    if (user.role === 'admin' && queryParams.tenant && queryParams.tenant !== 'all') {
        indexPattern = `log-${String(queryParams.tenant).toLowerCase()}`;
    }

    // เวลา (Time Range)
    let timeFilter: any = { gte: "now-24h/h" };
    
    if (queryParams.startTime && queryParams.endTime) {
        timeFilter = { gte: queryParams.startTime, lte: queryParams.endTime };
    } else {
        const timeRange = queryParams.timeRange || '24h';
        if (timeRange === '1h') timeFilter = { gte: "now-1h/m" };
        else if (timeRange === '7d') timeFilter = { gte: "now-7d/d" };
        else if (timeRange === '15m') timeFilter = { gte: "now-15m/m" };
        else timeFilter = { gte: "now-24h/h" };
    }

    const response = await osClient.search({
        index: indexPattern,
        body: {
            size: 0,
            query: {
                bool: {
                    filter: [
                        { range: { "@timestamp": timeFilter } }
                    ]
                }
            },
            aggs: {
                // จัด IP ที่เจอมากสุด
                top_ips: {
                    terms: { field: "src_ip.keyword", size: 5 }
                },
                // จัดอันดับ Event Type
                top_events: {
                    terms: { field: "event_type.keyword", size: 5 }
                },
                // จัดอันดับ User
                top_users: {
                    terms: { field: "user.keyword", size: 5 }
                },
                // Timeline
                timeline: {
                    date_histogram: {
                        field: "@timestamp",
                        calendar_interval: "hour"
                    }
                },
                // Recent High Severity
                recent_alerts: {
                    filter: {
                        bool: {
                            should: [
                                { terms: { "severity.keyword": ["high", "critical", "High", "Critical"] } },
                                { terms: { "severity": [3, 4, 5, 6, 7, 8, 9, 10] } },
                                { terms: { "severity.keyword": ["3", "4", "5", "6", "7", "8", "9", "10"] } }
                            ],
                            minimum_should_match: 1
                        }
                    },
                    aggs: {
                        latest_docs: {
                            top_hits: {
                                sort: [{ "@timestamp": { order: "desc" } }],
                                size: 5
                            }
                        }
                    }
                }
            }
        }
    });

    const recentAlertsHits = (response.body.aggregations as any)?.recent_alerts?.latest_docs?.hits?.hits || [];
    const recentAlerts = recentAlertsHits.map((h: any) => ({ _id: h._id, ...h._source }));

    return {
        total_events: typeof response.body.hits?.total === 'number' ? response.body.hits.total : response.body.hits?.total?.value || 0,
        top_ips: (response.body.aggregations as any)?.top_ips?.buckets || [],
        top_events: (response.body.aggregations as any)?.top_events?.buckets || [],
        top_users: (response.body.aggregations as any)?.top_users?.buckets || [],
        timeline: (response.body.aggregations as any)?.timeline?.buckets || [],
        recent_alerts: recentAlerts
    };
};

// API สำหรับ Investigate Entity (Threat Hunting)
export const investigateEntityService = async (user: { role: string; tenant: string }, entity: string) => {
    // กรอง index ตาม RBAC role: Admin -> log-* || Viewer -> log-tenant
    const indexPattern = user.role === 'admin' ? 'log-*' : `log-${user.tenant.toLowerCase()}`;

    const mustConditions: any[] = [
        {
            bool: {
                should: [
                    { terms: { "severity.keyword": ["high", "critical", "High", "Critical"] } },
                    { terms: { "severity": [3, 4, 5, 6, 7, 8, 9, 10] } },
                    { terms: { "severity.keyword": ["3", "4", "5", "6", "7", "8", "9", "10"] } }
                ],
                minimum_should_match: 1
            }
        }
    ];

    if (entity) {
        mustConditions.push({ query_string: { query: `"${entity}"` } });
    }

    const response = await osClient.search({
        index: indexPattern,
        body: {
            size: 50,
            query: {
                bool: {
                    must: mustConditions
                }
            },
            sort: [{ "@timestamp": { order: "desc" } }],
            aggs: {
                first_seen: { min: { field: "@timestamp" } },
                last_seen: { max: { field: "@timestamp" } },
                top_events: { terms: { field: "event_type.keyword", size: 5 } },
                related_ips: { terms: { field: "src_ip.keyword", size: 5 } },
                related_users: { terms: { field: "user.keyword", size: 5 } },
                related_hosts: { terms: { field: "host.keyword", size: 5 } },
                timeline: {
                    date_histogram: {
                        field: "@timestamp",
                        calendar_interval: "hour"
                    }
                }
            }
        }
    });

    const hits = (response.body.hits?.hits || []).map((h: any) => ({ _id: h._id, ...h._source }));
    
    // Sort by severity (Critical > High > Medium > Low > Info)
    const severityRank: Record<string, number> = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1, 'info': 0 };
    const getRank = (sev: any) => {
        if (typeof sev === 'number') return sev;
        if (typeof sev === 'string') return severityRank[sev.toLowerCase()] ?? -1;
        return -1;
    };
    hits.sort((a: any, b: any) => getRank(b.severity) - getRank(a.severity));

    return {
        total_events: typeof response.body.hits?.total === 'number' ? response.body.hits.total : response.body.hits?.total?.value || 0,
        first_seen: (response.body.aggregations as any)?.first_seen?.value_as_string || null,
        last_seen: (response.body.aggregations as any)?.last_seen?.value_as_string || null,
        top_events: (response.body.aggregations as any)?.top_events?.buckets || [],
        related_ips: (response.body.aggregations as any)?.related_ips?.buckets || [],
        related_users: (response.body.aggregations as any)?.related_users?.buckets || [],
        related_hosts: (response.body.aggregations as any)?.related_hosts?.buckets || [],
        timeline: (response.body.aggregations as any)?.timeline?.buckets || [],
        recent_logs: hits
    };
};
