const http = require('http');

const loginData = JSON.stringify({ username: 'admin', password: 'adminpassword' });

console.log("กำลังเข้าสู่ระบบเพื่อขอ Token...");
const req = http.request('http://localhost:8000/api/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const parsed = JSON.parse(data);
        const token = parsed.access_token;
        if (!token) {
            console.error("Login failed!");
            return;
        }

        console.log("กำลังจำลองการโจมตี...");

        let count = 0;
        const interval = setInterval(() => {
            if (count >= 6) {
                clearInterval(interval);
                console.log("\ ยิง Log จำลองเสร็จสิ้น!");
                console.log(" กลับไปที่หน้าเว็บ แล้วรอประมาณ 1 นาทีให้ระบบ Cron Job ตรวจจับการโจมตีครับ");
                return;
            }
            count++;

            // ข้อมูลจำลองการโจมตี Brute-Force จากไอพี 192.168.1.100
            const logData = JSON.stringify({
                tenant: "demoA",
                source: "system",
                action: "login_failed",
                src_ip: "192.168.1.100",
                msg: "Invalid password for administrator",
                event_type: "auth"
            });

            const req2 = http.request('http://localhost:8000/api/v1/ingest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                    'Content-Length': Buffer.byteLength(logData)
                }
            }, (res2) => {
                console.log(`[HTTP ${res2.statusCode}] ส่ง Log ที่ ${count} สำเร็จ!`);
            });

            req2.on('error', err => console.error("Error sending log:", err.message));
            req2.write(logData);
            req2.end();
        }, 200); // ยิงรัวๆ ห่างกัน 0.2 วินาที
    });
});

req.on('error', err => console.error("Connection error:", err.message));
req.write(loginData);
req.end();
