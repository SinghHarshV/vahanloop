export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tickets;
  if (user.roles.includes('ADMIN')) {
    tickets = await db.supportTicket.findMany();
  } else {
    tickets = await db.supportTicket.findMany({ where: { raisedBy: user.id } });
  }

  return NextResponse.json({ tickets });
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
      const { category, subject, description, priority = 'MEDIUM', bookingId } = body;
      if (!category || !subject || !description) {
        return NextResponse.json({ error: 'Missing mandatory ticket fields' }, { status: 400 });
      }

      const userRole = user.roles.includes('ADMIN') ? 'ADMIN' : user.roles.includes('OWNER') ? 'OWNER' : user.roles.includes('DRIVER') ? 'DRIVER' : 'CUSTOMER';

      const ticket = await db.supportTicket.create({
        data: {
          raisedBy: user.id,
          raisedByRole: userRole,
          category,
          subject,
          description,
          priority,
          status: 'OPEN',
          bookingId: bookingId || null,
        },
      });

      // Add initial message
      await db.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: user.id,
          senderName: user.fullName,
          senderRole: userRole,
          message: description,
        },
      });

      return NextResponse.json({ success: true, ticket });
    } else if (action === 'ADD_MESSAGE') {
      const { ticketId, message } = body;
      if (!ticketId || !message) {
        return NextResponse.json({ error: 'Missing ticketId or message' }, { status: 400 });
      }

      const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } });
      if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

      const userRole = user.roles.includes('ADMIN') ? 'ADMIN' : user.roles.includes('OWNER') ? 'OWNER' : user.roles.includes('DRIVER') ? 'DRIVER' : 'CUSTOMER';

      const msg = await db.supportMessage.create({
        data: {
          ticketId,
          senderId: user.id,
          senderName: user.fullName,
          senderRole: userRole,
          message,
        },
      });

      return NextResponse.json({ success: true, message: msg });
    } else if (action === 'UPDATE_STATUS') {
      if (!user.roles.includes('ADMIN')) {
        return NextResponse.json({ error: 'Only support agents or admins can update ticket status' }, { status: 403 });
      }
      const { ticketId, status, resolutionNotes } = body;
      const updated = await db.supportTicket.update({
        where: { id: ticketId },
        data: {
          status,
          resolutionNotes: resolutionNotes || null,
        },
      });
      return NextResponse.json({ success: true, ticket: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Support operation failed' }, { status: 500 });
  }
}
