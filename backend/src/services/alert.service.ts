import { osClient } from "../config/opensearch.js";

// login Alert
export const checkloginFailures = async () => {
    try {
        console.log("[Alert] กำลังตรวจสอบการล็อกอินที่ผิดปกติ...");

        // log [action] -> login_failed in 5 min
        const response = await osClient.search({
            index: "log-*",
            body: {
                size: 0, // เอายอดรวม
                query: {
                    bool: {
                        must: [
                            { match: { action: "login_failed" } },
                            { range: { "@timestamp": { gte: "now-1m/m" } } } // 1m
                        ]
                    }
                },
                aggs: {
                    ips: {
                        // check ip if login_failed > 5 alert
                        terms: { field: "src_ip.keyword", min_doc_count: 5 }
                    }
                }
            }
        });

        const buckets = (response.body.aggregations as any)?.ips?.buckets || [];

        if (buckets.length === 0) {
            console.log("[Alert] ไม่มีใครพยายามเจาะ");
        }

        for (const bucket of buckets) {
            const ip = bucket.key;
            const count = bucket.doc_count;

            console.log(`[alert] ip ที่หน้าสงสัย ${ip} ล็อกอินผิด ${count} ครั้ง ใน 1 นาที`)

            await osClient.index({
                index: "alerts",
                body: {
                    "@timestamp": new Date().toISOString(),
                    tenant: "all",
                    source: "system",
                    event_type: "alert",
                    severity: 10,
                    action: "brute_force_detected",
                    src_ip: ip,
                    msg: `Detected ${count} failed logins in the last 1 minute from IP ${ip}`
                }
            });
        }
    } catch (error) {
        console.error("[Alert] เกิดข้อผิดพลาด", error)
    }
};

export const startAlertCron = () => {
    // in start server
    checkloginFailures();

    // check every 1 min
    setInterval(checkloginFailures, 60 * 1000);
};

export const getAlertsService = async (user: { role: string; tenant: string }) => {
    const query = user.role === 'admin' 
        ? { match_all: {} } 
        : { bool: { should: [ { match: { tenant: user.tenant } }, { match: { tenant: "all" } } ] } };

    const response = await osClient.search({
        index: "alerts*",
        body: {
            size: 50,
            sort: [{ "@timestamp": { order: "desc" } }],
            query: query
        }
    });
    return response.body.hits.hits.map((h: any) => h._source);
};