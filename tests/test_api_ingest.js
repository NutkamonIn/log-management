const http = require('http');
const https = require('https');

// Usage: node tests/test_api_ingest.js [local|docker|aws]
const target = process.argv[2] || 'aws';
const isDocker = target === 'docker';
const isLocal = target === 'local';
const API_URL = isDocker ? 'http://backend:8000/api/v1' : isLocal ? 'http://localhost:8000/api/v1' : 'https://log.demo-labs.site/api/v1';
const client = (isDocker || isLocal) ? http : https;

console.log(`[Test] API Ingestion Test via HTTP POST to ${API_URL}`);

// 1. Login as Admin
const loginData = JSON.stringify({ username: 'admin', password: 'adminpassword' });
const reqLogin = client.request(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const token = JSON.parse(data).access_token;
        if (!token) {
            console.error("[ERROR] Login failed:", data);
            return;
        }
        console.log("[SUCCESS] Logged in successfully");

        // 2. Post a single Log
        const logData = JSON.stringify({
            tenant: "demoA",
            source: "api_test",
            event_type: "TestEvent",
            msg: "This is a test log from test_api_ingest.js"
        });

        const reqIngest = client.request(`${API_URL}/ingest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                'Content-Length': Buffer.byteLength(logData)
            }
        }, (res2) => {
            let resData = '';
            res2.on('data', chunk => resData += chunk);
            res2.on('end', () => {
                if (res2.statusCode === 200) {
                    console.log(`[SUCCESS] Ingest Successful: ${resData}`);
                } else {
                    console.error(`[ERROR] Ingest Failed (${res2.statusCode}): ${resData}`);
                }
            });
        });

        reqIngest.on('error', err => console.error("Ingest Error:", err));
        reqIngest.write(logData);
        reqIngest.end();
    });
});

reqLogin.on('error', err => console.error("Login Error:", err));
reqLogin.write(loginData);
reqLogin.end();
