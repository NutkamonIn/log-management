# คู่มือการติดตั้งระบบ (Local Appliance)

เอกสารฉบับนี้อธิบายวิธีการติดตั้งและรันระบบ Log Management ในรูปแบบ Appliance ท้องถิ่น หรือบน Virtual Machine เครื่องเดียว เหมาะสำหรับการทดสอบ (Proof of Concept) และการพัฒนา

## ความต้องการของระบบ (Prerequisites)
- **ระบบปฏิบัติการ (OS):** Ubuntu 22.04 LTS หรือสูงกว่า (แนะนำสำหรับการทำ Appliance)
- **หน่วยประมวลผล (CPU):** ขั้นต่ำ 4 vCPU
- **หน่วยความจำ (Memory):** ขั้นต่ำ 8 GB RAM
- **พื้นที่จัดเก็บข้อมูล (Storage):** ขั้นต่ำ 40 GB
- **พอร์ตเครือข่าย (Network Ports):** ต้องเปิดพอร์ต 80 (HTTP), 443 (HTTPS), 5141/5142 (UDP Syslog) บนระบบ Firewall
- **ซอฟต์แวร์:** Docker Engine และ Docker Compose (ไม่จำเป็นต้องมี Node.js หากรันผ่าน Container ทั้งหมด)

## การติดตั้งและการใช้งาน (Installation and Execution)

กระบวนการติดตั้งได้ถูกทำให้อัตโนมัติผ่าน Batch Script เพื่อเพิ่มความสะดวกสบายให้กับนักพัฒนา (Developer Experience)

1. **ไปยังโฟลเดอร์ของโปรเจกต์:**
   เปิด PowerShell หรือ Command Prompt แล้วพิมพ์คำสั่ง:
   ```powershell
   cd path/to/log-management
   ```

2. **เปิดการทำงานของระบบ:**
   ```powershell
   .\start.bat
   ```
   *คำสั่งนี้จะทำการสร้าง (Build) Docker Image และเริ่มต้นเซอร์วิสทั้งหมด กรุณารอจนกระทั่งระบบแจ้งเตือนว่าการรันเสร็จสมบูรณ์ (System is running!)*

3. **การเริ่มต้นของเซอร์วิส:**
   OpenSearch จำเป็นต้องใช้เวลาประมาณ 30 วินาทีในการเริ่มต้นระบบอย่างสมบูรณ์ โดย Backend service ได้ถูกตั้งค่าให้รอจนกว่า OpenSearch จะพร้อมทำงานก่อนเริ่มกระบวนการอื่น

4. **การเข้าถึงระบบ:**
   - **ส่วนแสดงผล Frontend (Dashboard & Logs Explorer):** `http://localhost`
   - **Backend API:** `http://localhost:8000`
   - **OpenSearch (Raw Access):** `http://localhost:9200`
   - **OpenSearch Dashboards:** `http://localhost:5601`

   *หมายเหตุ: สามารถตรวจสอบความล่าช้าของการเรียก API (Observability metrics) ได้จากหน้าต่าง Terminal ของ Backend*

   *ข้อมูลสำหรับการเข้าสู่ระบบ (Authentication Credentials):*
   - ผู้ดูแลระบบ (Administrator): `admin` / `adminpassword`
   - ผู้เยี่ยมชม Tenant A: `viewer_demoa` / `viewer123`
   - ผู้เยี่ยมชม Tenant B: `viewer_demob` / `viewer123`

---

## การจำลองข้อมูลเข้าสู่ระบบ (Data Seeding)

เพื่อทดสอบการทำงานของ Dashboard จำเป็นต้องจำลองข้อมูลเข้าสู่ระบบ

1. **การจำลองข้อมูลผ่าน HTTP API (JSON):**
   ```powershell
   cd ingest
   npm install
   npm run http
   ```
   *สคริปต์นี้จำลองการสร้าง Log จาก CrowdStrike, AWS, Microsoft AD และ Custom APIs*

2. **การจำลองข้อมูลผ่าน Syslog (UDP 5141/5142):**
   ```powershell
   cd ingest
   npm run syslog
   ```
   *สคริปต์นี้จำลองการส่งข้อมูลเครือข่ายผ่านโปรโตคอล Syslog*

---

## การปิดและล้างระบบ (System Teardown)

- **ปิดการทำงานเซอร์วิสทั้งหมด:** 
  ```powershell
  .\stop.bat
  ```
  *(หยุดการทำงานของ Container แต่ยังเก็บรักษาข้อมูลใน OpenSearch ไว้)*

- **ล้างฐานข้อมูล:** 
  ```powershell
  .\clean.bat
  ```
  *(ลบข้อมูลปริมาณ OpenSearch ทั้งหมดอย่างถาวร ใช้เมื่อต้องการคืนค่าระบบเป็นสถานะเริ่มต้น)*
