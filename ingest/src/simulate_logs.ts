import axios from 'axios';

const API_URL = 'https://log.demo-labs.site/api/v1';

const crowdStrikeLog = {
    tenant: "demoA",
    source: "crowdstrike",
    event_type: "malware_detected",
    host: "WIN10-01",
    process: "powershell.exe",
    severity: 8,
    sha256: "abc...",
    action: "quarantine",
    raw: JSON.stringify({ eventName: "Malware detected" })
};

const adLog = {
    tenant: "demoA",
    source: "ad",
    event_id: 4625,
    event_type: "LogonFailed",
    user: "demo\\eve",
    host: "DC01",
    ip: "203.0.113.77",
    logon_type: 3,
};

const apiLog = {
    tenant: "demoB",
    source: "api",
    event_type: "app_login_failed",
    user: "alice",
    ip: "203.0.113.7",
    reason: "wrong_password",
};

const awsLog = {
    tenant: "demoB",
    source: "aws",
    cloud: { service: "iam", account_id: "123456789012", region: "ap-southeast-1" },
    event_type: "CreateUser",
    user: "admin",
    raw: JSON.stringify({ eventName: "CreateUser", requestParameters: { userName: "temp-user" } })
};

const unknownLog = {
    tenant: "unknown",
    source: "api",
    event_type: "unrecognized_activity",
    user: "hacker",
    ip: "8.8.8.8",
    reason: "probing",
};

async function simulate() {
    console.log(" Starting HTTP Log Simulation (CrowdStrike, AD, API, AWS)...");

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

    const logs = [crowdStrikeLog, adLog, apiLog, awsLog, unknownLog];

    for (let i = 0; i < logs.length; i++) {
        try {
            await axios.post(`${API_URL}/ingest`, logs[i], {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`[HTTP] Sent ${logs[i].source} log successfully`);
        } catch (e: any) {
            console.error(`[HTTP] Failed to send ${logs[i].source} log:`, e.message);
        }
    }
}

simulate();
