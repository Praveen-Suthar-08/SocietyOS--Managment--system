import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession, requireRole } from '@/lib/permissions';
import { emergencyService } from '@/server/services/emergency-service';

const ResolveSchema = z.object({
  resolutionNotes: z.string().min(3, 'Resolution summary notes are mandatory'),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    requireRole(session, ['SECURITY', 'ADMIN']);
    const { id } = await params;

    const body = await req.json();
    const parsed = ResolveSchema.parse(body);

    const incident = await emergencyService.resolveIncident(
      session.user.societyId,
      id,
      { id: session.user.id, name: session.user.name, role: session.user.role },
      parsed.resolutionNotes
    );

    return NextResponse.json({ incident, message: 'Incident marked as resolved' });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
