import request from 'supertest';
import app from './app';
import { civicInputService } from './services/CivicInputService';

// Mock the authentication middleware
jest.mock('./middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: '507f1f77bcf86cd799439011', role: 'CITIZEN' };
    next();
  },
  authorize: () => (req: any, res: any, next: any) => next()
}));

// Mock CivicInputService to avoid DB and AI calls during unit tests
jest.mock('./services/CivicInputService');

describe('Civic Inputs API', () => {
  it('should allow a citizen to submit a text need', async () => {
    (civicInputService.submitInput as jest.Mock).mockResolvedValue({
      _id: 'mocked-id',
      citizenId: '507f1f77bcf86cd799439011',
      inputType: 'TEXT',
      text: 'Test need',
      status: 'RECEIVED'
    });

    const res = await request(app)
      .post('/api/v1/civic-inputs')
      .send({
        inputType: 'TEXT',
        text: 'Test need'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inputType).toBe('TEXT');
  });
});
