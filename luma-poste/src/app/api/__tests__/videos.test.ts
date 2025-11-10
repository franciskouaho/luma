import { NextRequest } from 'next/server';
import { GET, POST } from '../videos/route';

// Mock the firestore service
jest.mock('@/lib/firestore', () => ({
  videoService: {
    getByUserId: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
  },
}));

import { videoService } from '@/lib/firestore';

describe('/api/videos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return videos for a user', async () => {
      const mockVideos = [
        {
          id: '1',
          userId: 'user123',
          title: 'Test Video',
          storageKey: 'uploads/user123/test.mp4',
          duration: 120,
          size: 1024000,
          status: 'uploaded',
          createdAt: { seconds: Date.now() / 1000 },
          updatedAt: { seconds: Date.now() / 1000 },
        },
      ];

      (videoService.getByUserId as jest.Mock).mockResolvedValue(mockVideos);

      const request = new NextRequest('http://localhost:3000/api/videos?userId=user123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.videos).toEqual(mockVideos);
      expect(videoService.getByUserId).toHaveBeenCalledWith('user123', 10);
    });

    it('should return 400 if userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/videos');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userId est requis');
    });

    it('should filter by status', async () => {
      const mockVideos = [
        {
          id: '1',
          userId: 'user123',
          title: 'Test Video',
          storageKey: 'uploads/user123/test.mp4',
          duration: 120,
          size: 1024000,
          status: 'uploaded',
          createdAt: { seconds: Date.now() / 1000 },
          updatedAt: { seconds: Date.now() / 1000 },
        },
      ];

      (videoService.getByUserId as jest.Mock).mockResolvedValue(mockVideos);

      const request = new NextRequest('http://localhost:3000/api/videos?userId=user123&status=uploaded');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.videos).toEqual(mockVideos);
    });
  });

  describe('POST', () => {
    it('should create a new video', async () => {
      const mockVideo = {
        id: '1',
        userId: 'user123',
        title: 'Test Video',
        storageKey: 'uploads/user123/test.mp4',
        duration: 120,
        size: 1024000,
        status: 'uploaded',
        createdAt: { seconds: Date.now() / 1000 },
        updatedAt: { seconds: Date.now() / 1000 },
      };

      (videoService.create as jest.Mock).mockResolvedValue('1');
      (videoService.getById as jest.Mock).mockResolvedValue(mockVideo);

      const request = new NextRequest('http://localhost:3000/api/videos', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          title: 'Test Video',
          storageKey: 'uploads/user123/test.mp4',
          duration: 120,
          size: 1024000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockVideo);
      expect(videoService.create).toHaveBeenCalledWith({
        userId: 'user123',
        title: 'Test Video',
        storageKey: 'uploads/user123/test.mp4',
        duration: 120,
        size: 1024000,
        status: 'uploaded',
        thumbnailKey: 'uploads/user123/test.jpg',
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/videos', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          title: 'Test Video',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Tous les champs sont requis');
    });
  });
});
