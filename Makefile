.PHONY: start stop restart build logs clean seed

# คำสั่งสำหรับรันระบบทั้งหมดแบบ Appliance (One-Click)
start:
	docker-compose up -d --build

# หยุดระบบ
stop:
	docker-compose down

# เริ่มระบบใหม่
restart: stop start

# ดู Log ทั้งหมด
logs:
	docker-compose logs -f

# ลบข้อมูลที่อยู่ใน Database ทั้งหมด (ระวังใช้งาน)
clean:
	docker-compose down -v

# คำสั่งจำลองการส่ง Log เพื่อใช้ทดสอบ
seed-syslog:
	cd ingest && npx tsx src/simulate_syslog.ts

seed-http:
	cd ingest && npx tsx src/simulate_logs.ts
