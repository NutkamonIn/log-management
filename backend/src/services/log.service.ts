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
export const searchLogsService = async (user: { role: string; tenant: string }, q?: string, timeRange?: string) => {
    // role == admin ดึงทุก Index (logs-*) แต่ถ้าเป็น viewer ให้ดึง tenant ของตน
    const indexPattern = user.role === 'admin' ? 'log-*' : `log-${user.tenant.toLowerCase()}`;

    // กำหนดเวลา (Time Range)
    let gte = "now-15m/m"; // default 15 mins
    if (timeRange === '15m') gte = "now-15m/m";
    if (timeRange === '1h') gte = "now-1h/m";
    if (timeRange === '24h') gte = "now-24h/h";
    if (timeRange === '7d') gte = "now-7d/d";

    const response = await osClient.search({
        index: indexPattern,
        body: {
            query: {
                bool: {
                    must: q ? [{ query_string: { query: q } }] : [{ match_all: {} }],
                    filter: [{ range: { "@timestamp": { gte } } }]
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
    const timeRange = queryParams.timeRange || '24h';
    let gte = "now-24h/h";
    if (timeRange === '1h') gte = "now-1h/m";
    if (timeRange === '7d') gte = "now-7d/d";

    const response = await osClient.search({
        index: indexPattern,
        body: {
            size: 0,
            query: {
                bool: {
                    filter: [
                        { range: { "@timestamp": { gte } } }
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
                }
            }
        }
    });

    return {
        total_events: typeof response.body.hits?.total === 'number' ? response.body.hits.total : response.body.hits?.total?.value || 0,
        top_ips: (response.body.aggregations as any)?.top_ips?.buckets || [],
        top_events: (response.body.aggregations as any)?.top_events?.buckets || [],
        top_users: (response.body.aggregations as any)?.top_users?.buckets || [],
        timeline: (response.body.aggregations as any)?.timeline?.buckets || []
    };
};
