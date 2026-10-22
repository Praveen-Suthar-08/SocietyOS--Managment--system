import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export interface GuardDocument {
  id: string;
  name: string;
  badgeNumber: string;
  phone: string;
  gateAssignment: string;
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  status: 'ON_DUTY' | 'OFF_DUTY' | 'PATROL';
  lastCheckIn: string;
  societyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_GUARDS: GuardDocument[] = [
  {
    id: 'sec-801',
    name: 'Officer Vikram Singh',
    badgeNumber: 'SEC-801',
    phone: '+91 98765 22001',
    gateAssignment: 'Gate 1 (Main Entrance)',
    shift: 'MORNING',
    status: 'ON_DUTY',
    lastCheckIn: '10 mins ago',
  },
  {
    id: 'sec-802',
    name: 'Officer Ramesh Kumar',
    badgeNumber: 'SEC-802',
    phone: '+91 98765 22002',
    gateAssignment: 'Gate 1 North (Visitor Terminal)',
    shift: 'MORNING',
    status: 'ON_DUTY',
    lastCheckIn: '15 mins ago',
  },
  {
    id: 'sec-803',
    name: 'Officer Dilip Jha',
    badgeNumber: 'SEC-803',
    phone: '+91 98765 22003',
    gateAssignment: 'Gate 2 (Service & Deliveries)',
    shift: 'MORNING',
    status: 'PATROL',
    lastCheckIn: '2 mins ago (Basement 1)',
  },
  {
    id: 'sec-804',
    name: 'Officer Manoj Yadav',
    badgeNumber: 'SEC-804',
    phone: '+91 98765 22004',
    gateAssignment: 'Gate 1 (Main Entrance)',
    shift: 'EVENING',
    status: 'OFF_DUTY',
    lastCheckIn: 'Shift starts 15:00',
  },
];

declare global {
  var _memoryGuards: GuardDocument[] | undefined;
}
if (!global._memoryGuards) {
  global._memoryGuards = [...DEFAULT_GUARDS];
}

export async function GET(req: NextRequest) {
  try {
    const db = await getDb().catch(() => null);
    if (db) {
      const col = db.collection<GuardDocument>('securityGuards');
      const guards = await col.find({}).sort({ createdAt: -1 }).toArray();
      if (guards.length > 0) {
        return NextResponse.json({ guards });
      } else {
        await col.insertMany(
          DEFAULT_GUARDS.map((g) => ({
            ...g,
            societyId: 'soc-greenfield-blr',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        );
        const seeded = await col.find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json({ guards: seeded });
      }
    }
  } catch (err) {
    console.warn('MongoDB security guards fetch failed, falling back to memory store:', (err as Error).message);
  }

  return NextResponse.json({ guards: global._memoryGuards || DEFAULT_GUARDS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newGuard: GuardDocument = {
      id: body.id || `sec-${Date.now()}`,
      name: body.name,
      badgeNumber: body.badgeNumber?.toUpperCase() || 'SEC-000',
      phone: body.phone || '+91 98765 22000',
      gateAssignment: body.gateAssignment || 'Gate 1 (Main Entrance)',
      shift: body.shift || 'MORNING',
      status: body.status || 'ON_DUTY',
      lastCheckIn: body.lastCheckIn || 'Just onboarded',
      societyId: 'soc-greenfield-blr',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in global memory store
    if (global._memoryGuards) {
      global._memoryGuards = [newGuard, ...global._memoryGuards];
    }

    // Persist to MongoDB
    try {
      const db = await getDb().catch(() => null);
      if (db) {
        const col = db.collection<GuardDocument>('securityGuards');
        await col.insertOne(newGuard);
      }
    } catch (err) {
      console.warn('MongoDB security guard insert error (stored in memory fallback):', (err as Error).message);
    }

    return NextResponse.json({ success: true, guard: newGuard }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
