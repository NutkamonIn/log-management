import axios from 'axios';

// Usage: 
// npx tsx ingest/src/simulate_logs.ts docker  -> To send to backend
// npx tsx ingest/src/simulate_logs.ts local   -> To send to localhost
// npx tsx ingest/src/simulate_logs.ts         -> To send to AWS
const target = process.argv[2];
const API_URL = target === 'docker'
    ? 'http://backend:8000/api/v1'
    : target === 'local' 
    ? 'http://localhost:8000/api/v1' 
    : 'https://log.demo-labs.site/api/v1';

function randomDate(startDaysAgo: number, endDaysAgo: number) {
    const start = new Date();
    start.setDate(start.getDate() - startDaysAgo);
    
    const end = new Date();
    end.setDate(end.getDate() - endDaysAgo);
    
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

const templates = [
    {
        tenant: "demoA", source: "crowdstrike", event_type: "malware_detected", severity: 8,
        action: "quarantine", host: "WIN10-01", process: "powershell.exe", sha256: "abc...", raw: '{"eventName": "Malware detected"}'
    },
    {
        tenant: "demoA", source: "ad", event_id: 4624, event_type: "LogonSuccess",
        user: "demo\\alice", host: "DC01", ip: "192.168.1.10", logon_type: 3
    },
    {
        tenant: "demoA", source: "ad", event_id: 4625, event_type: "LogonFailed",
        user: "demo\\eve", host: "DC01", ip: "203.0.113.77", logon_type: 3
    },
    {
        tenant: "demoB", source: "api", event_type: "app_login_failed",
        user: "bob", ip: "203.0.113.7", reason: "wrong_password"
    },
    {
        tenant: "demoB", source: "aws", event_type: "CreateUser",
        user: "admin", cloud: { service: "iam", account_id: "123456789012", region: "ap-southeast-1" },
        raw: '{"eventName": "CreateUser", "requestParameters": {"userName": "temp-user"}}'
    },
    {
        tenant: "demoB", source: "aws", event_type: "TerminateInstances",
        user: "dev", cloud: { service: "ec2", account_id: "123456789012", region: "ap-southeast-1" },
        raw: '{"eventName": "TerminateInstances", "requestParameters": {"instanceSet": {"items": [{"instanceId": "i-1234567890abcdef0"}]}}}'
    },
    {
        tenant: "demoA", source: "nginx", event_type: "access", status: 200, http_method: "GET", url: "/api/data",
        ip: "8.8.8.8"
    },
    {
        tenant: "demoA", source: "nginx", event_type: "error", status: 500, http_method: "POST", url: "/api/upload",
        ip: "1.1.1.1"
    }
];

async function simulate() {
    console.log(" Starting HTTP Log Simulation (200 Logs)...");

    // Get Token
    let token = "";
    try {
        const loginRes = await axios.post(`${API_URL}/login`, { username: 'admin', password: 'adminpassword' });
        token = loginRes.data.access_token;
        console.log(" Logged in successfully");
    } catch (e: any) {
        console.error(" Login failed:", e.message);
        return;
    }

    const totalLogs = 200;
    for (let i = 0; i < totalLogs; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // 10% of logs are older than 7 days (8-10 days ago), 90% are within the last 3 days
        const isOld = Math.random() < 0.1;
        const timestamp = isOld ? randomDate(10, 7) : randomDate(3, 0);

        const logPayload = { ...template, "@timestamp": timestamp };

        try {
            await axios.post(`${API_URL}/ingest`, logPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (i % 20 === 0) {
                console.log(`[HTTP] Sent ${i} logs...`);
            }
        } catch (e: any) {
            console.error(`[HTTP] Failed to send log:`, e.message);
        }
    }
    console.log(`[HTTP] Sent all ${totalLogs} logs successfully.`);
}

simulate();
