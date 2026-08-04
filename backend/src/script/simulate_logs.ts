import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

async function runSimulation() {
    console.log("============ ยิง log เข้าสู่ระบบ Backend ============");

    try {
        // login role Admin 
        console.log("============ จำลองการเข้าสู่ระบบ ============");
        const loginResponse = await axios.post(`${BASE_URL}/login`, {
            username: "admin",
            password: "adminpassword"
        });

        const token = loginResponse.data.access_token;
        console.log(" ============ Login Success ============")

        // กำหนด Header แนบ Token ไปด้วยที่ยิง API
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type' : 'application/json'
        };

        // จำลองจากแหล่งที่มา 1 AD
        const adLog = {
            tenant: "demoA",
            source: "ad",
            event_type: "authentication",
            user: "jhondoe",
            host: "DC_SERVER-01",
            raw: "EventID: 4625, Logon Type: 3, Status:0xC000006D, Caller: johndoe - Failed login attempt"
        };

        const res1 = await axios.post(`${BASE_URL}/ingest`, adLog, { headers });
        console.log(`[AD Log] ยิงสำเร็จ -> Index: ${res1.data.index}, ID: ${res1.data.id}`);

        // จำลอง Log จากแหล่งที่มา 2: CrowdStrike (EDR)
        const csLog = {
            tenant: "demoB",
            source: "crowdstrike",
            event_type: "endpoint_protection",
            severity: 9,
            host: "WIN-WORKSTATION-05",
            process: "malicious.exe",
            raw: "CrowStrike Falcon: Malware blocked on WIN-WORKSTATION-05. Process: malicious.exe"
        };

        const res2 = await axios.post(`${BASE_URL}/ingest`, csLog, { headers });
        console.log(`[CrowdStrike Log] ยิงสำเร็จ -> Index: ${res2.data.index}, ID: ${res2.data.id}`);

        // ลองเรียก API ค้นหา (Search) เพื่อตรวจสอบข้อมูล
        console.log("============ ทดสอบการดึงข้อมูล (Search) ============");
        const searchRes = await axios.get(`${BASE_URL}/search`, { headers });
        console.log(`[Search] ดึงสำเร็จ! เจอข้อมูล ${searchRes.data.data.length} รายการ (สิทธิ์ของ Tenant: ${searchRes.data.tenant_access})`);

        console.log(" ============ Final ============");
    } catch (error: any) {
        console.error(" เกิดข้อผิดพลาดในการจำลอง ", error.response?.data || error.message)
    }
}

// RunFunction
runSimulation();