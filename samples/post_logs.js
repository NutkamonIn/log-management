const fs = require('fs');
const path = require('path');

// Usage: node post_logs.js [local]
// Default targets AWS. Pass 'local' as an argument to target localhost.

const target = process.argv[2] || 'aws';
const API_URL = target === 'local' ? 'http://localhost:8000/api/v1' : 'https://log.demo-labs.site/api/v1';

async function login() {
    console.log(`Logging into ${API_URL}/login...`);
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'adminpassword' })
        });
        
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const data = await response.json();
        console.log("Login successful.");
        return data.access_token;
    } catch (error) {
        console.error("Login failed:", error.message);
        process.exit(1);
    }
}

async function postLog(filename, token) {
    const filepath = path.join(__dirname, filename);
    let logData = fs.readFileSync(filepath, 'utf8');

    // แปลง @timestamp เป็นเวลาปัจจุบัน เพื่อให้แสดงในหน้าจอ Dashboard (Last 15 minutes) ได้ทันที
    try {
        let jsonObj = JSON.parse(logData);
        jsonObj["@timestamp"] = new Date().toISOString();
        logData = JSON.stringify(jsonObj);
    } catch (e) {
        console.warn(`Could not parse JSON for ${filename}, sending as-is.`);
    }

    console.log(`Sending ${filename}...`);
    try {
        const response = await fetch(`${API_URL}/ingest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: logData
        });
        
        console.log(`[Success] ${filename} ingested. Status: ${response.status}`);
    } catch (error) {
        console.error(`[Error] Failed to ingest ${filename}:`, error.message);
    }
}

async function main() {
    const token = await login();
    
    const filesToSend = [
        "aws_cloudtrail.json",
        "m365_audit.json",
        "crowdstrike.json",
        "windows_ad.json"
    ];
    
    for (const file of filesToSend) {
        await postLog(file, token);
    }
}

main();
