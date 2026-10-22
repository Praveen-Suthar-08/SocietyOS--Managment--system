import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession, requireRole } from '@/lib/permissions';
import { emergencyService } from '@/server/services/emergency-service';

const NoteSchema = z.object({
  note: z.string().min(2, 'Note content is required'),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    requireRole(session, ['SECURITY', 'ADMIN']);
    const { id } = await params;

    const body = await req.json();
    const parsed = NoteSchema.parse(body);

    const event = await emergencyService.addTimelineNote(
      session.user.societyId,
      id,
      { id: session.user.id, name: session.user.name, role: session.user.role },
      parsed.note
    );

    return NextResponse.json({ event, message: 'Timeline note appended' }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
