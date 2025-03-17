import { GET } from './route';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data
    }))
  }
}));

describe('/api/hello', () => {
  it('should return a 200 status and expected JSON data', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('message', 'Hello from the API!');
    expect(data).toHaveProperty('status', 'success');
    expect(data).toHaveProperty('timestamp');
  });
});