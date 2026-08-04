import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Auth API (Login)', () => {
    it('เข้าสู่ระบบสำเร็จเมื่อรหัสถูกต้อง', async () => {
        const response = await request(app)
            .post('/api/v1/login')
            .send({
                username: 'admin',
                password: 'adminpassword'
            });

        expect(response.status).toBe(200); // send 200
        expect(response.body).toHaveProperty('access_token'); // have Token
    });

    it('รหัสผ่านไม่ถูกต้อง ควรจะ error', async () => {
        const response = await request(app)
            .post('/api/v1/login')
            .send({
                username: 'admin',
                password: 'testpassword'
            });

        expect(response.status).toBe(401);
        expect(response.body.detail).toBe('Incorrect username or password');

    });
});