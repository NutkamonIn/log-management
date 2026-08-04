import app from './app.js';
import { startSyslogServer } from './services/syslog.service.js';
import { startRetentionCron } from './services/retention.service.js';
import { startAlertCron } from './services/alert.service.js';

const PORT = process.env.PORT || 8000;

// เปิด UDP Syslog
startSyslogServer();

// หน่วงเวลา 30 วินาทีให้ OpenSearch บูตเสร็จก่อนเริ่ม Cron Jobs
setTimeout(() => {
    startRetentionCron();
    startAlertCron();
}, 30000);

// Start Port
app.listen(PORT, () => {
    console.log(` Express server is running on http://localhost:${PORT}`);
});