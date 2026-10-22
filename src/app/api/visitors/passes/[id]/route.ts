import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Pass code or ID required' }, { status: 400 });
    }

    const db = await getDb().catch(() => null);
    if (db) {
      const col = db.collection('visitorPasses');
      await col.deleteOne({
        $or: [{ id }, { passCode: id }],
      });
    }

    return NextResponse.json({ success: true, message: `Pass ${id} deleted` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const db = await getDb().catch(() => null);
    if (db) {
      const col = db.collection('visitorPasses');
      await col.updateOne(
        { $or: [{ id }, { passCode: id }] },
        {
          $set: {
            ...body,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
