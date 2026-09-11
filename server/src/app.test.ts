import request from 'supertest';
import app from './app';

describe('App', () => {
  it('should return a 200 OK on /api/v1/health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});
