import { connectDB, db } from '../config/db.js';

describe('MongoDB connection', () => {
  beforeAll(async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await connectDB();
  });

  it('should log console message', () => {
    expect(console.log).toHaveBeenCalledWith('Connected to mongodb');
  });

  it('should have a defined db object', () => {
    expect(db).toBeDefined();
  });
});
