export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { documentStorage } from '@/lib/documentStorage';

interface RouteContext {
  params: { fileKey: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const expires = Number(searchParams.get('expires'));

    const rawKey = decodeURIComponent(params.fileKey);

    // 1. Signature Verification if accessed via short-lived signed link
    const secret = process.env.JWT_SECRET || 'vahanloop_secret_vault';
    let isSignedValid = false;
    if (token && expires && expires > Math.floor(Date.now() / 1000)) {
      const expectedToken = crypto
        .createHmac('sha256', secret)
        .update(`${rawKey}:${expires}`)
        .digest('hex');

      if (token === expectedToken) {
        isSignedValid = true;
      }
    }

    // 2. Server-side Role & Ownership Permission Check
    let authorized = false;

    if (session) {
      if (session.roles.includes('ADMIN')) {
        authorized = true;
      } else {
        // Extract vehicleId from fileKey structure: "<vehicleId>/<category>/<uuid_filename>"
        const vehicleId = rawKey.split('/')[0];
        const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
        if (vehicle && vehicle.ownerId === session.userId) {
          authorized = true;
        }
      }
    }

    // Require either a valid short-lived signed token or an active authorized session
    if (!authorized && !isSignedValid) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not have permission to view this confidential vehicle document' },
        { status: 403 }
      );
    }

    // 3. Read private file
    const fileBuffer = await documentStorage.readDocument(rawKey);
    if (!fileBuffer) {
      return NextResponse.json({ error: 'Document file not found' }, { status: 404 });
    }

    // Log access
    if (session) {
      await db.auditLog.create({
        data: {
          actorId: session.userId,
          action: 'DOCUMENT_ACCESSED',
          entityType: 'VEHICLE_DOCUMENT',
          entityId: rawKey,
          details: `Accessed document by ${session.email}`,
        },
      });
    }

    // Determine content type safely
    let contentType = 'application/pdf';
    if (rawKey.endsWith('.jpg') || rawKey.endsWith('.jpeg')) contentType = 'image/jpeg';
    if (rawKey.endsWith('.png')) contentType = 'image/png';

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('Document download error:', error);
    return NextResponse.json({ error: 'Failed to retrieve document' }, { status: 500 });
  }
}
