# คู่มือการ Deploy แบบ SaaS/Cloud

เอกสารนี้อธิบายวิธีการนำระบบ **Log Management** ขึ้นไปติดตั้งบน Cloud Server สาธารณะ (เช่น AWS EC2, DigitalOcean, Azure) เพื่อเปิดให้บริการในรูปแบบ SaaS (Software as a Service)

## ความต้องการของระบบ (System Requirements)
- **OS:** Ubuntu 22.04 LTS (หรือใหม่กว่า)
- **CPU:** ขั้นต่ำ 4 vCPU
- **RAM:** ขั้นต่ำ 8 GB
- **Disk:** ขั้นต่ำ 40 GB
- **Network Ports:** ต้องอนุญาต (Allow) พอร์ต 80 (HTTP), 443 (HTTPS), 5141/5142 (UDP Syslog) บน Firewall หรือ Security Group
- **Software:** Docker Engine และ Docker Compose

---

## ขั้นตอนการติดตั้ง (Deployment Steps)

1. **โคลน Source Code ลงใน Server**
   ```bash
   git clone https://github.com/your-username/log-management.git
   cd log-management
   ```

2. **ตั้งค่ารหัสผ่าน (Environment Variables)**
   แก้ไขไฟล์ `docker-compose.yml` (หรือสร้างไฟล์ `.env`) และเปลี่ยน `JWT_SECRET` ให้เป็นรหัสผ่านที่เดายาก:
   ```yaml
   environment:
     - OPENSEARCH_URL=https://admin:admin@opensearch:9200
     - JWT_SECRET=P@ssw0rdSuperSecr3t2026!#RandomXYZ
   ```

3. **สั่งรันระบบด้วย Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

4. **ตรวจสอบการทำงาน**
   ดูสถานะของ Container ทั้งหมดว่าขึ้นคำว่า `Up` หรือไม่
   ```bash
   docker-compose ps
   ```

---

## การเชื่อมต่อแบบความปลอดภัยสูง (HTTPS/TLS)

ระบบรองรับการตั้งค่าใบรับรองความปลอดภัย 2 รูปแบบ:

1. **Self-signed SSL Certificate (สำหรับทดสอบด้วย IP):** 
   ระบบจะสร้างขึ้นอัตโนมัติเมื่อรันผ่าน Docker ครั้งแรก หากเข้าใช้งานผ่าน IP จะพบหน้าต่างแจ้งเตือน "Your connection is not private" ให้กดยอมรับความเสี่ยงเพื่อเข้าสู่ระบบ

2. **Let's Encrypt SSL (สำหรับผู้ที่มีโดเมนจริง เช่น demo-labs.site):**
   เพื่อความสมบูรณ์แบบระดับ Production แนะนำให้จดโดเมน ชี้ DNS A Record มาที่ Server IP จากนั้นใช้ Nginx และ Certbot ในการขอใบรับรองฟรี
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d logs.demo-labs.site
   ```
   ซึ่งจะทำให้ระบบของคุณมีหน้ากุญแจสีเขียวสมบูรณ์แบบ 100%

---

## การรับส่ง Log ไปยัง Cloud Server

ในฝั่งของลูกค้า (Client) ที่ต้องการยิง Log มารวมที่ Cloud Server ของเรา ให้เปลี่ยน IP จาก `127.0.0.1` เป็น Public IP ของ Server นี้:

**1. ยิงผ่าน HTTP API (JSON):**
ใช้ Endpoint: `https://<YOUR_SERVER_PUBLIC_IP>/api/v1/ingest`

**2. ยิงผ่าน Syslog (UDP):**
ลูกค้า Tenant A: ส่ง Syslog ไปที่ Port `5141`
ลูกค้า Tenant B: ส่ง Syslog ไปที่ Port `5142`
*(อย่าลืมเปิด Firewall / Security Group บน Cloud Provider ให้พอร์ตเหล่านี้สามารถทะลุเข้ามาได้)*
