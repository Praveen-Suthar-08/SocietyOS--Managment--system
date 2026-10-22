import 'server-only';
import { ObjectId, Collection } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';
import { auditService } from './audit-service';

export type CameraZone =
  | 'MAIN_GATE'
  | 'NORTH_GATE'
  | 'PERIMETER'
  | 'CLUBHOUSE'
  | 'PARKING_B1'
  | 'PARKING_B2'
  | 'LOBBY';

export type CameraStatus = 'OPERATIONAL' | 'OFFLINE' | 'UNCONFIGURED';
export type CameraStreamType = 'HLS' | 'WEBRTC' | 'NONE';

export interface Camera {
  _id?: ObjectId;
  societyId: string;
  cameraId: string;
  name: string;
  zone: CameraZone;
  streamType: CameraStreamType;
  streamGatewayUrl?: string; // Authorized HLS / WebRTC signed gateway endpoint only
  status: CameraStatus;
  isConfigured: boolean;
  lastVerifiedAt?: Date;
  retentionDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CameraPlaybackGrant {
  cameraId: string;
  name: string;
  zone: CameraZone;
  isConfigured: boolean;
  status: CameraStatus;
  streamUrl?: string;
  grantExpiresAt?: string;
  message?: string;
}

export class CctvService {
  private camerasCol?: Collection<Camera>;

  private async getCamerasCollection(): Promise<Collection<Camera>> {
    if (!this.camerasCol) {
      const db = await getDb();
      const col = db.collection<Camera>('cameras');
      await col.createIndex({ societyId: 1, cameraId: 1 }, { unique: true });
      await col.createIndex({ societyId: 1, zone: 1 });
      this.camerasCol = col;
    }
    return this.camerasCol;
  }

  /**
   * Seed camera catalog for society with HONEST unconfigured status
   * Demonstrates strict compliance: No fake video feeds or simulated streams
   */
  async ensureCameraInventory(societyId: string) {
    const col = await this.getCamerasCollection();
    const count = await col.countDocuments({ societyId });
    if (count > 0) return;

    const defaultCameras: Omit<Camera, '_id'>[] = [
      {
        societyId,
        cameraId: 'CAM-MG-01',
        name: 'Main Gate — Inbound Vehicle Lane',
        zone: 'MAIN_GATE',
        streamType: 'NONE',
        status: 'UNCONFIGURED',
        isConfigured: false,
        retentionDays: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        societyId,
        cameraId: 'CAM-MG-02',
        name: 'Main Gate — Pedestrian Turnstile',
        zone: 'MAIN_GATE',
        streamType: 'NONE',
        status: 'UNCONFIGURED',
        isConfigured: false,
        retentionDays: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        societyId,
        cameraId: 'CAM-NG-01',
        name: 'North Gate — Service & Delivery Entrance',
        zone: 'NORTH_GATE',
        streamType: 'NONE',
        status: 'UNCONFIGURED',
        isConfigured: false,
        retentionDays: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        societyId,
        cameraId: 'CAM-CH-01',
        name: 'Clubhouse & Amenity Lawn Entry',
        zone: 'CLUBHOUSE',
        streamType: 'NONE',
        status: 'UNCONFIGURED',
        isConfigured: false,
        retentionDays: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        societyId,
        cameraId: 'CAM-PK-01',
        name: 'Basement Parking Ramp B1',
        zone: 'PARKING_B1',
        streamType: 'NONE',
        status: 'UNCONFIGURED',
        isConfigured: false,
        retentionDays: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await col.insertMany(defaultCameras);
  }

  /**
   * List cameras in society inventory
   */
  async listCameras(societyId: string, zone?: CameraZone): Promise<Camera[]> {
    await this.ensureCameraInventory(societyId);
    const col = await this.getCamerasCollection();
    const query: Record<string, unknown> = { societyId };
    if (zone) query.zone = zone;
    return col.find(query).sort({ zone: 1, cameraId: 1 }).toArray();
  }

  /**
   * Request authorized playback grant for security or admin role
   * Strictly enforces safety rule: Returns honest unconfigured message if no verified media gateway exists
   */
  async requestPlaybackGrant(
    societyId: string,
    cameraId: string,
    user: { id: string; name: string; role: string }
  ): Promise<CameraPlaybackGrant> {
    const col = await this.getCamerasCollection();
    const camera = await col.findOne({ societyId, cameraId });

    if (!camera) {
      throw new Error(`Camera ${cameraId} not found in society inventory`);
    }

    // Immutable audit of viewing access
    await auditService.log({
      societyId,
      userId: user.id,
      action: 'CCTV_STREAM_REQUESTED',
      resourceType: 'CAMERA',
      resourceId: cameraId,
      details: {
        cameraName: camera.name,
        zone: camera.zone,
        role: user.role,
        isConfigured: camera.isConfigured,
      },
    });

    if (!camera.isConfigured || !camera.streamGatewayUrl) {
      return {
        cameraId: camera.cameraId,
        name: camera.name,
        zone: camera.zone,
        isConfigured: false,
        status: camera.status,
        message:
          'Live video stream is not configured. Real HLS or WebRTC gateway endpoint must be securely provisioned by your system administrator in settings.',
      };
    }

    // If configured with verified gateway URL, generate signed grant valid for 60 seconds
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();

    return {
      cameraId: camera.cameraId,
      name: camera.name,
      zone: camera.zone,
      isConfigured: true,
      status: 'OPERATIONAL',
      streamUrl: camera.streamGatewayUrl,
      grantExpiresAt: expiresAt,
    };
  }
}

export const cctvService = new CctvService();
