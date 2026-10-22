import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession, requireRole } from '@/lib/permissions';
import {
  announcementService,
  AnnouncementAudience,
  AnnouncementPriority,
} from '@/server/services/announcement-service';

const createAnnouncementSchema = z.object({
  title: z.string().min(3).max(150),
  body: z.string().min(5),
  audience: z.enum(['ALL', 'RESIDENTS', 'SECURITY']),
  priority: z.enum(['NORMAL', 'URGENT']).optional(),
  publishImmediately: z.boolean().optional(),
});

export async function GET() {
  try {
    const verified = await requireSession();

    let items;
    if (verified.user.role === 'ADMIN') {
      items = await announcementService.getAllAnnouncements(verified.user.societyId);
    } else {
      items = await announcementService.getAnnouncementsForRole(
        verified.user.societyId,
        verified.user.role
      );
    }

    return NextResponse.json({ items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch announcements';
    const status = (err as { statusCode?: number }).statusCode || 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const verified = await requireRole(['ADMIN']);
    const body = await req.json();
    const validated = createAnnouncementSchema.parse(body);

    const announcement = await announcementService.createAnnouncement({
      societyId: verified.user.societyId,
      title: validated.title,
      body: validated.body,
      audience: validated.audience as AnnouncementAudience,
      priority: validated.priority as AnnouncementPriority,
      publishImmediately: validated.publishImmediately,
      actorId: verified.user.id,
      actorRole: verified.user.role,
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create announcement';
    const status = (err as { statusCode?: number }).statusCode || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
