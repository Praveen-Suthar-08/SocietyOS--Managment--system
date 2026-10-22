import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export interface ParcelDocument {
  id: string;
  trackingId: string;
  courier: string;
  unitCode: string;
  residentName: string;
  pickupOtp: string;
  status: 'HELD_AT_GATE' | 'COLLECTED';
  receivedAt: string;
  collectedAt?: string;
  receivedByGuard?: string;
  gateGuard?: string;
  storageBay?: string;
  releasedBy?: string;
  societyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_PARCELS: ParcelDocument[] = [
  {
    id: 'p-1',
    trackingId: 'AWB-4029-AMZ-8812',
    courier: 'Amazon Logistics (1 Corrugated Box)',
    unitCode: 'A-402',
    residentName: 'Aarav Sharma',
    pickupOtp: '7294',
    status: 'HELD_AT_GATE',
    receivedAt: 'Today, 11:15 AM',
    gateGuard: 'Officer Ramesh Kumar · Gate 1 North',
    receivedByGuard: 'Officer Ramesh Kumar',
    storageBay: 'Bay B-14 (Secure Courier Room)',
    societyId: 'soc-greenfield-blr',
  },
  {
    id: 'p-2',
    trackingId: 'SWIGGY-INSTA-4401',
    courier: 'Swiggy Instamart (Grocery Bag)',
    unitCode: 'A-402',
    residentName: 'Aarav Sharma',
    pickupOtp: '1109',
    status: 'COLLECTED',
    receivedAt: 'Yesterday, 18:20',
    collectedAt: 'Yesterday, 18:35',
    gateGuard: 'Officer Vikram Singh · Gate 1 North',
    receivedByGuard: 'Officer Vikram Singh',
    storageBay: 'Bay A-03',
    societyId: 'soc-greenfield-blr',
  },
  {
    id: 'p-3',
    trackingId: 'BLUEDART-8820-91',
    courier: 'BlueDart Express (Documents Pouch)',
    unitCode: 'B-104',
    residentName: 'Sneha Patel',
    pickupOtp: '3318',
    status: 'HELD_AT_GATE',
    receivedAt: 'Today, 09:40 AM',
    gateGuard: 'Officer Manoj Yadav · Gate 1',
    receivedByGuard: 'Officer Manoj Yadav',
    storageBay: 'Bay A-01',
    societyId: 'soc-greenfield-blr',
  },
];

export async function GET(req: NextRequest) {
  try {
    const db = await getDb().catch(() => null);
    if (db) {
      const col = db.collection<ParcelDocument>('parcels');
      const parcels = await col.find({}).sort({ createdAt: -1 }).toArray();
      if (parcels.length > 0) {
        return NextResponse.json({ parcels });
      } else {
        await col.insertMany(
          DEFAULT_PARCELS.map((p) => ({
            ...p,
            societyId: 'soc-greenfield-blr',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        );
        const seeded = await col.find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json({ parcels: seeded });
      }
    }
  } catch (err) {
    console.warn('MongoDB parcels fetch failed:', (err as Error).message);
  }

  return NextResponse.json({ parcels: DEFAULT_PARCELS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newParcel: ParcelDocument = {
      id: body.id || `p-${Date.now()}`,
      trackingId: body.trackingId || `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
      courier: body.courier,
      unitCode: body.unitCode,
      residentName: body.residentName,
      pickupOtp: body.pickupOtp || `${Math.floor(1000 + Math.random() * 9000)}`,
      status: body.status || 'HELD_AT_GATE',
      receivedAt: body.receivedAt || new Date().toLocaleString(),
      gateGuard: body.gateGuard,
      receivedByGuard: body.receivedByGuard,
      storageBay: body.storageBay,
      societyId: 'soc-greenfield-blr',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const db = await getDb().catch(() => null);
      if (db) {
        const col = db.collection<ParcelDocument>('parcels');
        await col.insertOne(newParcel);
      }
    } catch (err) {
      console.warn('MongoDB parcel insert failed:', (err as Error).message);
    }

    return NextResponse.json({ success: true, parcel: newParcel }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, releasedBy, collectedAt } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing parcel id' }, { status: 400 });
    }

    try {
      const db = await getDb().catch(() => null);
      if (db) {
        const col = db.collection<ParcelDocument>('parcels');
        await col.updateOne(
          { id },
          {
            $set: {
              ...(status ? { status } : {}),
              ...(releasedBy ? { releasedBy } : {}),
              ...(collectedAt ? { collectedAt } : {}),
              updatedAt: new Date().toISOString(),
            },
          }
        );
      }
    } catch (err) {
      console.warn('MongoDB parcel update failed:', (err as Error).message);
    }

    return NextResponse.json({ success: true, id, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
