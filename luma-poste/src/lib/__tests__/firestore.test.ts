import { VideoService, ScheduleService, TikTokAccountService } from '../firestore';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase Admin
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      add: jest.fn(),
      doc: jest.fn(),
      get: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
    })),
  })),
}));

describe('VideoService', () => {
  let videoService: VideoService;

  beforeEach(() => {
    videoService = new VideoService();
  });

  it('should create a video', async () => {
    const mockVideo = {
      userId: 'user123',
      title: 'Test Video',
      storageKey: 'uploads/user123/test.mp4',
      duration: 120,
      size: 1024000,
      status: 'uploaded' as const,
    };

    // Mock addDoc to return a mock document reference
    const mockAddDoc = jest.fn().mockResolvedValue({ id: 'video123' });
    const mockCollection = jest.fn().mockReturnValue({ add: mockAddDoc });
    
    // Mock the Firestore instance
    const mockFirestore = {
      collection: mockCollection,
    };
    
    // Replace the adminDb with our mock
    (videoService as any).adminDb = mockFirestore;

    const result = await videoService.create(mockVideo);

    expect(result).toBe('video123');
    expect(mockAddDoc).toHaveBeenCalledWith({
      ...mockVideo,
      createdAt: expect.any(Object),
      updatedAt: expect.any(Object),
    });
  });

  it('should get video by id', async () => {
    const mockVideoData = {
      userId: 'user123',
      title: 'Test Video',
      storageKey: 'uploads/user123/test.mp4',
      duration: 120,
      size: 1024000,
      status: 'uploaded',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const mockDoc = {
      exists: true,
      data: () => mockVideoData,
    };

    const mockGetDoc = jest.fn().mockResolvedValue(mockDoc);
    const mockDocRef = jest.fn().mockReturnValue({ get: mockGetDoc });
    const mockCollection = jest.fn().mockReturnValue({ doc: mockDocRef });
    
    const mockFirestore = {
      collection: mockCollection,
    };
    
    (videoService as any).adminDb = mockFirestore;

    const result = await videoService.getById('video123');

    expect(result).toEqual({
      id: 'video123',
      ...mockVideoData,
    });
  });
});

describe('ScheduleService', () => {
  let scheduleService: ScheduleService;

  beforeEach(() => {
    scheduleService = new ScheduleService();
  });

  it('should create a schedule', async () => {
    const mockSchedule = {
      userId: 'user123',
      videoId: 'video123',
      accountId: 'account123',
      title: 'Test Schedule',
      description: 'Test description',
      hashtags: ['#test'],
      scheduledAt: Timestamp.fromDate(new Date()),
      status: 'scheduled' as const,
    };

    const mockAddDoc = jest.fn().mockResolvedValue({ id: 'schedule123' });
    const mockCollection = jest.fn().mockReturnValue({ add: mockAddDoc });
    
    const mockFirestore = {
      collection: mockCollection,
    };
    
    (scheduleService as any).adminDb = mockFirestore;

    const result = await scheduleService.create(mockSchedule);

    expect(result).toBe('schedule123');
    expect(mockAddDoc).toHaveBeenCalledWith({
      ...mockSchedule,
      createdAt: expect.any(Object),
      updatedAt: expect.any(Object),
    });
  });
});

describe('TikTokAccountService', () => {
  let tiktokAccountService: TikTokAccountService;

  beforeEach(() => {
    tiktokAccountService = new TikTokAccountService();
  });

  it('should create a TikTok account', async () => {
    const mockAccount = {
      userId: 'user123',
      platform: 'tiktok' as const,
      tiktokUserId: 'tiktok123',
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
      accessTokenEnc: 'encrypted_token',
      refreshTokenEnc: 'encrypted_refresh',
      expiresAt: Timestamp.fromDate(new Date()),
      isActive: true,
    };

    const mockAddDoc = jest.fn().mockResolvedValue({ id: 'account123' });
    const mockCollection = jest.fn().mockReturnValue({ add: mockAddDoc });
    
    const mockFirestore = {
      collection: mockCollection,
    };
    
    (tiktokAccountService as any).adminDb = mockFirestore;

    const result = await tiktokAccountService.create(mockAccount);

    expect(result).toBe('account123');
    expect(mockAddDoc).toHaveBeenCalledWith({
      ...mockAccount,
      createdAt: expect.any(Object),
      updatedAt: expect.any(Object),
    });
  });
});
