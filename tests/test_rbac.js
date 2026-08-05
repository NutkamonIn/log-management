const http = require('http');
const https = require('https');

// Usage: node tests/test_rbac.js [local|docker|aws]
const target = process.argv[2] || 'aws';
const isDocker = target === 'docker';
const isLocal = target === 'local';
const API_URL = isDocker ? 'http://backend:8000/api/v1' : isLocal ? 'http://localhost:8000/api/v1' : 'https://log.demo-labs.site/api/v1';
const client = (isDocker || isLocal) ? http : https;

console.log(`[Test] RBAC Data Isolation Test via HTTP GET to ${API_URL}`);

// 1. Login as Viewer (Tenant: demoA)
const loginData = JSON.stringify({ username: 'viewer_demoa', password: 'viewer123' });
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
        console.log("[SUCCESS] Logged in successfully as 'viewer_demoa'");

        // 2. Fetch logs and verify we ONLY get tenant = demoA
        const searchPath = `${API_URL}/search?limit=100`;
        const reqSearch = client.request(searchPath, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }, (res2) => {
            let resData = '';
            res2.on('data', chunk => resData += chunk);
            res2.on('end', () => {
                if (res2.statusCode === 200) {
                    const logs = JSON.parse(resData).data || [];
                    console.log(`Received ${logs.length} logs.`);
                    
                    const hasOtherTenants = logs.some(log => {
                        const tenant = log._source ? log._source.tenant : log.tenant;
                        return tenant !== 'demoA';
                    });
                    if (hasOtherTenants) {
                        console.error("[ERROR] RBAC FAILED! Viewer saw logs from other tenants!");
                    } else if (logs.length === 0) {
                        console.log("[WARN] RBAC Test Passed, but no logs found for demoA. Try running simulator first.");
                    } else {
                        console.log("[SUCCESS] RBAC Test Passed! All fetched logs correctly belong to tenant 'demoA'.");
                    }
                } else {
                    console.error(`[ERROR] Search API Failed (${res2.statusCode}): ${resData}`);
                }
            });
        });

        reqSearch.on('error', err => console.error("Search Error:", err));
        reqSearch.end();
    });
});

reqLogin.on('error', err => console.error("Login Error:", err));
reqLogin.write(loginData);
reqLogin.end();
