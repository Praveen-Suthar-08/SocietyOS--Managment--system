import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectId } from 'mongodb';
import { cctvService, Camera } from '@/server/services/cctv-service';

const mockCameras: Camera[] = [];

const mockCamerasCol = {
  createIndex: vi.fn().mockResolvedValue('ok'),
  countDocuments: vi.fn().mockImplementation(async () => mockCameras.length),
  insertMany: vi.fn().mockImplementation(async (docs: Camera[]) => {
    docs.forEach((d) => mockCameras.push({ ...d, _id: new ObjectId() }));
  }),
  findOne: vi.fn().mockImplementation(async (query: Record<string, unknown>) => {
    return (
      mockCameras.find((c) => {
        if (query.societyId && c.societyId !== query.societyId) return false;
        if (query.cameraId && c.cameraId !== query.cameraId) return false;
        return true;
      }) || null
    );
  }),
  find: vi.fn().mockImplementation((query: Record<string, unknown>) => {
    const filtered = mockCameras.filter((c) => {
      if (query.societyId && c.societyId !== query.societyId) return false;
      if (query.zone && c.zone !== query.zone) return false;
      return true;
    });
    return {
      sort: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue(filtered),
    };
  }),
};

vi.mock('@/lib/db/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: () => mockCamerasCol,
  }),
}));

vi.mock('@/server/services/audit-service', () => ({
  auditService: {
    log: vi.fn().mockResolvedValue({}),
  },
}));

describe('CctvService & Safe Video Streaming Boundary', () => {
  beforeEach(() => {
    mockCameras.length = 0;
    vi.clearAllMocks();
  });

  it('initializes camera inventory with honest unconfigured status and zero fake feeds', async () => {
    const cameras = await cctvService.listCameras('society-1');
    expect(cameras.length).toBeGreaterThan(0);
    expect(cameras.every((c) => c.status === 'UNCONFIGURED')).toBe(true);
    expect(cameras.every((c) => c.isConfigured === false)).toBe(true);
    expect(cameras.every((c) => !c.streamGatewayUrl)).toBe(true);
  });

  it('strictly returns honest unconfigured response without fake streams when stream gateway is unprovisioned', async () => {
    await cctvService.ensureCameraInventory('society-1');
    const guard = { id: 'guard-1', name: 'Officer Singh', role: 'SECURITY' };

    const grant = await cctvService.requestPlaybackGrant('society-1', 'CAM-MG-01', guard);

    expect(grant.isConfigured).toBe(false);
    expect(grant.streamUrl).toBeUndefined();
    expect(grant.message).toContain('Live video stream is not configured');
  });

  it('rejects camera stream grant if camera does not exist in inventory', async () => {
    await cctvService.ensureCameraInventory('society-1');
    const guard = { id: 'guard-1', name: 'Officer Singh', role: 'SECURITY' };

    await expect(
      cctvService.requestPlaybackGrant('society-1', 'NON-EXISTENT-CAM', guard)
    ).rejects.toThrow('Camera NON-EXISTENT-CAM not found');
  });
});
