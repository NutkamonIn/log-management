import dgram from 'dgram';

const PORT = 514;
const HOST = '127.0.0.1';

// Log จาก 4.1
const syslogMessage = "<134>Aug 20 12:44:56 fw01 vendor=demo product=ngfw action=deny src=10.0.1.10 dst=8.8.8.8 spt=5353 dpt=53 proto=udp msg=DNS blocked policy=Block-DNS";

const client = dgram.createSocket('udp4');
const messageBuffer = Buffer.from(syslogMessage);

console.log("-------------- ยิง Syslog --------------");

// UDP || 127.0.0.1:514
client.send(messageBuffer, 0, messageBuffer.length, PORT, HOST, (err) => {
    if (err) {
        console.error("เกิดข้อผิดพลาดในการส่ง:", err);
    } else {
        console.log(`ส่ง Syslog สำเร็จไปยัง ${HOST}:${PORT}`);
        console.log(`เนื้อหา: ${syslogMessage}`);
    }
    client.close();
});
console.log("---------------- end -----------------")