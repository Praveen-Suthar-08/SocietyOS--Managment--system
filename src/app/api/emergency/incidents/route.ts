import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/permissions';
import { emergencyService } from '@/server/services/emergency-service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req).catch(() => null);
    const societyId = session?.user?.societyId || 'soc-greenfield-blr';

    const url = new URL(req.url);
    const includeAll = url.searchParams.get('all') === 'true' || url.searchParams.get('includeResolved') === 'true';

    if (!session || includeAll || session.user.role === 'ADMIN' || session.user.role === 'SECURITY') {
      const allIncidents = await emergencyService.getAllIncidents(societyId);
      return NextResponse.json({ incidents: allIncidents });
    }

    const activeIncidents = await emergencyService.getActiveIncidents(societyId);
    const myIncidents = await emergencyService.getResidentIncidents(societyId, session.user.id);
    const incidentMap = new Map<string, any>();
    activeIncidents.forEach((i) => incidentMap.set(i._id?.toString() || i.incidentNumber, i));
    myIncidents.forEach((i) => incidentMap.set(i._id?.toString() || i.incidentNumber, i));

    return NextResponse.json({ incidents: Array.from(incidentMap.values()) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req).catch(() => null);
    const societyId = session?.user?.societyId || 'soc-greenfield-blr';
    const body = await req.json();

    const incident = await emergencyService.triggerSOS(
      societyId,
      {
        id: session?.user?.id || 'admin-system',
        name: body.reportedBy || session?.user?.name || 'Estate Command',
        phone: body.reporterPhone || '+91 98765 22001',
        unitId: body.unitId || 'Administration',
      },
      {
        category: (body.category as any) || 'OTHER',
        severity: (body.severity as any) || 'HIGH',
        locationDescription: body.location || 'Campus Compound',
        description: body.description || 'Emergency incident recorded in command log',
      }
    );

    return NextResponse.json({ success: true, incident }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession(req).catch(() => null);
    const societyId = session?.user?.societyId || 'soc-greenfield-blr';
    const body = await req.json();
    const { incidentId, status, resolutionNotes, responder, note } = body;

    if (!incidentId) {
      return NextResponse.json({ error: 'incidentId is required' }, { status: 400 });
    }

    const actor = {
      id: session?.user?.id || 'admin-command',
      name: session?.user?.name || 'Estate Command Admin',
      role: session?.user?.role || 'ADMIN',
    };

    let updatedIncident = null;

    if (status === 'RESOLVED') {
      updatedIncident = await emergencyService.resolveIncident(
        societyId,
        incidentId,
        actor,
        resolutionNotes || 'Incident verified resolved by command authority'
      );
    } else if (status === 'ACKNOWLEDGED') {
      updatedIncident = await emergencyService.acknowledgeIncident(
        societyId,
        incidentId,
        actor,
        note
      );
    } else if (responder) {
      updatedIncident = await emergencyService.assignResponder(
        societyId,
        incidentId,
        actor,
        responder
      );
    }

    if (note) {
      await emergencyService.addTimelineNote(societyId, incidentId, actor, note).catch(() => {});
    }

    return NextResponse.json({ success: true, incident: updatedIncident });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

