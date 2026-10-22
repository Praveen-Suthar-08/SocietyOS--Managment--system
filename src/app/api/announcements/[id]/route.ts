import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/permissions';
import {
  announcementService,
  AnnouncementAudience,
  AnnouncementPriority,
} from '@/server/services/announcement-service';

const patchAnnouncementSchema = z.object({
  action: z.enum(['publish', 'archive', 'edit']).optional(),
  title: z.string().min(3).max(150).optional(),
  body: z.string().min(5).optional(),
  audience: z.enum(['ALL', 'RESIDENTS', 'SECURITY']).optional(),
  priority: z.enum(['NORMAL', 'URGENT']).optional(),
  correctionReason: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const verified = await requireRole(['ADMIN']);
    const { id } = await params;
    const body = await req.json();
    const validated = patchAnnouncementSchema.parse(body);

    if (validated.action === 'publish') {
      const updated = await announcementService.publishAnnouncement(
        id,
        verified.user.societyId,
        verified.user.id,
        verified.user.role
      );
      return NextResponse.json(updated);
    }

    if (validated.action === 'archive') {
      const updated = await announcementService.archiveAnnouncement(
        id,
        verified.user.societyId,
        verified.user.id,
        verified.user.role
      );
      return NextResponse.json(updated);
    }

    // Standard edit
    if (!validated.title || !validated.body) {
      return NextResponse.json(
        { error: 'Title and body are required for editing' },
        { status: 400 }
      );
    }

    const updated = await announcementService.updateAnnouncement({
      announcementId: id,
      societyId: verified.user.societyId,
      title: validated.title,
      body: validated.body,
      audience: validated.audience as AnnouncementAudience | undefined,
      priority: validated.priority as AnnouncementPriority | undefined,
      correctionReason: validated.correctionReason,
      actorId: verified.user.id,
      actorRole: verified.user.role,
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update announcement';
    const status = (err as { statusCode?: number }).statusCode || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
