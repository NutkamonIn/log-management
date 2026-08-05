import dgram from 'dgram';

const target = process.argv[2];
const HOST = target === 'local' ? '127.0.0.1' : 'log.demo-labs.site';
const PORT_A = 5141; // Tenant demoA
const PORT_B = 5142; // Tenant demoB
const client = dgram.createSocket('udp4');

// จำลองข้อมูลของลูกค้า demoA (ส่งไปพอร์ต 5141)
const messagesDemoA = [
    { port: PORT_A, msg: "<134>Aug 20 12:44:56 fw01 vendor=demo product=ngfw action=deny src=10.0.1.10 dst=8.8.8.8 spt=5353 dpt=53 proto=udp msg=DNS_blocked policy=Block-DNS" },
    { port: PORT_A, msg: "<190>Aug 20 13:01:02 r1 if=ge-0/0/1 event=link-down mac=aa:bb:cc:dd:ee:ff reason=carrier-loss" }
];

// จำลองข้อมูลของลูกค้า demoB (ส่งไปพอร์ต 5142)
const messagesDemoB = [
    { port: 5142, msg: "<134>Aug 20 14:22:11 fw01 vendor=demo product=ngfw action=allow src=192.168.1.50 dst=1.1.1.1 spt=4433 dpt=443 proto=tcp msg=Web_Traffic policy=Allow-Web" },
    { port: 5142, msg: "<134>Aug 20 14:25:00 fw02 vendor=demo product=ngfw action=deny src=172.16.0.5 dst=9.9.9.9 spt=12345 dpt=53 proto=udp msg=Malicious_DNS policy=Block-DNS" }
];

const allMessages = [...messagesDemoA, ...messagesDemoB];

console.log(" Starting Syslog Simulation (Dedicated Ports: 5141=demoA, 5142=demoB)...");

allMessages.forEach((data, index) => {
    setTimeout(() => {
        client.send(Buffer.from(data.msg), data.port, HOST, (err) => {
            if (err) console.error(err);
            else console.log(`[UDP] Sent to Port ${data.port}: ${data.msg}`);

            if (index === allMessages.length - 1) {
                setTimeout(() => client.close(), 1000);
            }
        });
    }, index * 1000);
});
