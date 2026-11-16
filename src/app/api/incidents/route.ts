import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  let incidents = await db.incidentReport.findMany();
  if (status) incidents = incidents.filter((i: any) => i.status === status);
  if (priority) incidents = incidents.filter((i: any) => i.priority === priority);

  // Non-admins see only incidents they reported or their fleet
  if (!user.roles.includes('ADMIN')) {
    incidents = incidents.filter((i: any) => i.reportedBy === user.id);
  }

  return NextResponse.json({ incidents });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action = 'CREATE' } = body;

    if (action === 'CREATE') {
      const { bookingId, vehicleId, driverId, category, priority = 'MEDIUM', title, description, location, emergencyContactUsed } = body;

      if (!title || !description || !category) {
        return NextResponse.json({ error: 'Missing title, category, or description' }, { status: 400 });
      }

      const userRole = user.roles.includes('ADMIN') ? 'ADMIN' : user.roles.includes('OWNER') ? 'OWNER' : user.roles.includes('DRIVER') ? 'DRIVER' : 'CUSTOMER';

      const incident = await db.incidentReport.create({
        data: {
          bookingId: bookingId || null,
          reportedBy: user.id,
          reportedByRole: userRole,
          vehicleId: vehicleId || null,
          driverId: driverId || null,
          category,
          priority,
          status: 'OPEN',
          title,
          description,
          location: location || null,
          emergencyContactUsed: Boolean(emergencyContactUsed),
        },
      });

      await db.auditLog.create({
        data: {
          actorId: user.id,
          action: 'INCIDENT_LOGGED',
          entityType: 'INCIDENT',
          entityId: incident.id,
          details: `Category: ${category}, Priority: ${priority}, Title: ${title}`,
        },
      });

      return NextResponse.json({ success: true, incident });
    } else if (action === 'UPDATE_STATUS') {
      if (!user.roles.includes('ADMIN')) {
        return NextResponse.json({ error: 'Only administrators can update incident status' }, { status: 403 });
      }

      const { incidentId, status, resolutionNotes, assignedAgentId } = body;
      const updated = await db.incidentReport.update({
        where: { id: incidentId },
        data: {
          status,
          resolutionNotes: resolutionNotes || null,
          assignedAgentId: assignedAgentId || user.id,
        },
      });

      return NextResponse.json({ success: true, incident: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Incident operation failed' }, { status: 500 });
  }
}
