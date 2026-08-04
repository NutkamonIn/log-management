import dgram from 'dgram';
import { indexLogService } from './log.service.js';
import { CentralLogSchema } from './parser.service.js';

const HOST = '0.0.0.0';

// แบบที่ 2: Dedicated Ports (แยกพอร์ตตามลูกค้า)
const TENANT_PORTS = [
    { port: 5141, tenant: "demoA", source: "firewall" },
    { port: 5142, tenant: "demoB", source: "firewall" }
];

export const startSyslogServer = () => {
    
    // สร้าง UDP Server สำหรับลูกค้าแต่ละรายแยกกัน
    TENANT_PORTS.forEach(({ port, tenant, source }) => {
        const server = dgram.createSocket('udp4');

        server.on('error', (err) => {
            console.error(`[Syslog-${tenant}] Server error on port ${port}:\n${err.stack}`);
            server.close();
        });

        server.on('message', async (msg, rinfo) => {
            const rawMessage = msg.toString('utf8').trim();
            const srcIp = rinfo.address;

            console.log(`[Syslog-${tenant}] รับข้อมูลจาก IP: ${srcIp} ที่พอร์ต ${port} -> บันทึกเข้า Tenant: ${tenant}`);

            const logData: CentralLogSchema = {
                tenant: tenant,
                source: source,
                event_type: 'network_traffic',
                src_ip: srcIp,
                raw: rawMessage
            };

            const systemUser = { role: "system", tenant: tenant };

            try {
                const result = await indexLogService(logData, systemUser);
                console.log(`[Syslog-${tenant}] นำเข้าสำเร็จ -> ID: ${result.id}`);
            } catch (error) {
                console.error(`[Syslog-${tenant}] เกิดข้อผิดพลาดในการบันทึก:`, error);
            }
        });

        server.on('listening', () => {
            console.log(`[Syslog] Server UDP เปิดรับ Tenant [${tenant}] ที่ Port: ${port}`);
        });

        server.bind(port, HOST);
    });
}