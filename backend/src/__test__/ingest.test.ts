import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Ingest API (ระบบรับ Log)', () => {
    let token = '';

    // ก่อนเทสระบบ Ingest เราต้องล็อกอินเพื่อเอา Token มาจำลองเป็น Admin ก่อน
    it('ควรดึง Token มาเตรียมไว้ได้สำเร็จ', async () => {
        const response = await request(app)
            .post('/api/v1/login')
            .send({ username: 'admin', password: 'adminpassword' });

        token = response.body.access_token;
        expect(token).toBeDefined();
    });

    it('ถ้ายิง Log เข้ามาโดยไม่มี Token จะต้องโดนปฏิเสธ (401)', async () => {
        const response = await request(app)
            .post('/api/v1/ingest')
            .send({
                source: "test_system",
                event_type: "test_event"
            });

        expect(response.status).toBe(401);
        expect(response.body.detail).toBe('No token provided, access denied');
    });

    it('ถ้ายิง Log พร้อม Token ที่ถูกต้อง ข้อมูลต้องเข้า Database สำเร็จ (200)', async () => {
        const response = await request(app)
            .post('/api/v1/ingest')
            .set('Authorization', `Bearer ${token}`)
            .send({
                tenant: "demoA",
                source: "unit_test",
                event_type: "test_success",
                msg: "This is an automated test log"
            });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });
});
