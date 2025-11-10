import { renderHook, act } from '@testing-library/react';
import { useVideos } from '../use-videos';

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('useVideos', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch videos on mount', async () => {
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

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ videos: mockVideos }),
    } as Response);

    const { result } = renderHook(() => useVideos('user123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.videos).toEqual([]);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.videos).toEqual(mockVideos);
    expect(mockFetch).toHaveBeenCalledWith('/api/videos?userId=user123&limit=50');
  });

  it('should create a video', async () => {
    const newVideo = {
      id: '2',
      userId: 'user123',
      title: 'New Video',
      storageKey: 'uploads/user123/new.mp4',
      duration: 90,
      size: 2048000,
      status: 'uploaded',
      createdAt: { seconds: Date.now() / 1000 },
      updatedAt: { seconds: Date.now() / 1000 },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ videos: [] }),
    } as Response);

    const { result } = renderHook(() => useVideos('user123'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newVideo,
    } as Response);

    await act(async () => {
      await result.current.createVideo({
        title: 'New Video',
        storageKey: 'uploads/user123/new.mp4',
        duration: 90,
        size: 2048000,
      });
    });

    expect(result.current.videos).toContain(newVideo);
    expect(mockFetch).toHaveBeenCalledWith('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user123',
        title: 'New Video',
        storageKey: 'uploads/user123/new.mp4',
        duration: 90,
        size: 2048000,
      }),
    });
  });

  it('should handle errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useVideos('user123'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network error');
  });
});
