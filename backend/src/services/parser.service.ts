import geoip from 'geoip-lite';

// กำหนดโครงสร้างกลาง (Central Schema Interface) เพื่อบังคับให้ Log ทุกตัวมีหน้าตาเหมือนกัน
export interface CentralLogSchema {
    "@timestamp"?: string;
    tenant: string;
    source: string;
    vendor?: string;
    product?: string;
    event_type: string;
    event_subtype?: string;
    severity?: number;
    action?: string;
    src_ip?: string;
    src_port?: number;
    dst_ip?: string;
    dst_port?: number;
    protocol?: string;
    user?: string;
    host?: string;
    process?: string;
    url?: string;
    http_method?: string;
    status_code?: number;
    rule_name?: string;
    rule_id?: string;
    geoip?: {
        country?: string;
        city?: string;
    }
    cloud?: {
        account_id?: string;
        region?: string;
        service?: string;
    };
    raw?: string;
    _tags?: string[];
    [key: string]: any; // รองรับฟิลด์เสริมอื่นๆ นอกเหนือจากนี้ได้
}

// ฟังก์ชันสำหรับแปลงข้อความ Log ดิบให้เข้าสู่ Schema กลาง (Normalization)
export const normalizeLog = (rawLog: CentralLogSchema): CentralLogSchema => {
    //นำข้อมูล Log ที่เข้ามาทั้งหมด
    const parsed: CentralLogSchema = { ...rawLog };

    // 2. Normalize Syslog
    if (parsed.raw && typeof parsed.raw === 'string') {
        const rawText = parsed.raw;
        const kvRegex = /([a-zA-Z0-9_.-]+)=([^\s]+)/g // key=value
        let match;
        while ((match = kvRegex.exec(rawText)) !== null) {
            const key = match[1];
            const value = match[2];

            if (key === 'src') parsed.src_ip = value;
            if (key === 'dst') parsed.dst_ip = value;
            if (key === 'spt') parsed.src_port = parseInt(value, 10);
            if (key === 'dpt') parsed.dst_port = parseInt(value, 10);
            if (key === 'proto') parsed.protocol = value;
            if (key === 'action') parsed.action = value;
            if (key === 'vendor') parsed.vendor = value;
            if (key === 'product') parsed.product = value;

            // Firewall
            if (key === 'policy') parsed.rule_name = value;
            if (key === 'msg') parsed.msg = value;

            // Router
            if (key === 'policy') parsed.event_subtype = value;
            if (key === 'mac') parsed.host = value;
            if (key === 'if') parsed.interface = value;
            if (key === 'ip') parsed.dst_ip = value;
        }
    }

    // 3. Normalize JSON 
    if (rawLog.ip && !parsed.src_ip) {
        parsed.src_ip = rawLog.ip;
        delete parsed.ip;
    }

    // 'event_id -> rule_id
    if (rawLog.event_id) {
        parsed.rule_id = String(rawLog.event_id);
    }

    // 'status' or 'reason' -> action
    if (rawLog.status && !parsed.action) {
        parsed.action = rawLog.status.toLowerCase();
    }
    if (rawLog.reason && !parsed.action) {
        parsed.action = rawLog.reason.toLowerCase();
    }
    
    // M365 'workload' -> product
    if (rawLog.workload && !parsed.product) {
        parsed.product = rawLog.workload;
    }

    // AWS CloudTrail: ensure 'raw' is stringified if it is an object
    if (parsed.raw && typeof parsed.raw === 'object') {
        parsed.raw = JSON.stringify(parsed.raw);
    }

    // Time
    if (!parsed["@timestamp"]) {
        parsed["@timestamp"] = new Date().toISOString();
    }

    // GeoIP
    if (parsed.src_ip) {
        const geo = geoip.lookup(parsed.src_ip);
        if (geo) {
            parsed.geoip = {
                country: geo.country,
                city: geo.city,
            };
        }
    }

    return parsed;
};