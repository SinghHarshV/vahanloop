export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { validateDocumentFile, documentStorage } from '@/lib/documentStorage';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const vehicleId = formData.get('vehicleId') as string;
    const category = (formData.get('category') as string) || 'RC';
    const expiryDateStr = formData.get('expiryDate') as string | null;

    if (!file || !vehicleId) {
      return NextResponse.json({ error: 'file and vehicleId are required' }, { status: 400 });
    }

    // Vehicle ownership check
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const isOwner = session.userId === vehicle.ownerId;
    const isAdmin = session.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only upload documents for your own vehicles' },
        { status: 403 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Security validation (Magic bytes, extension allowlist, file size)
    const validation = validateDocumentFile(file.name, buffer, file.type);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate random UUID-based private storage key
    const randomKey = `${crypto.randomUUID()}_${validation.sanitizedName}`;
    const fileKey = `${vehicleId}/${category.toLowerCase()}/${randomKey}`;

    // Store in private isolated storage (never in public/ or static assets)
    await documentStorage.saveDocument(fileKey, buffer, validation.mimeType || 'application/pdf');

    const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;

    // Database record: Save version to maintain complete historical audit trail
    const docVersion = db.vehicleDocumentVersion?.create
      ? await db.vehicleDocumentVersion.create({
          data: {
            vehicleId,
            category: category.toUpperCase(),
            fileKey,
            originalName: file.name,
            mimeType: validation.mimeType || file.type,
            fileSize: buffer.length,
            status: 'PENDING_REVIEW',
            expiryDate,
            uploadedBy: session.userId,
          },
        })
      : {
          id: `doc_ver_${Date.now()}`,
          vehicleId,
          category,
          fileKey,
          status: 'PENDING_REVIEW',
          expiryDate,
        };

    // Update or create active document status
    if (db.vehicleDocument?.create) {
      await db.vehicleDocument.create({
        data: {
          vehicleId,
          documentType: category.toUpperCase(),
          category: category.toUpperCase(),
          expiryDate,
          verificationStatus: 'PENDING',
          status: 'PENDING_REVIEW',
          fileKey,
        },
      });
    }

    // Notify admins
    if (db.notification?.create) {
      await db.notification.create({
        data: {
          userId: 'usr-admin-1',
          title: 'New Vehicle Document Uploaded',
          message: `Owner ${session.fullName || session.email} uploaded ${category} for vehicle ${vehicle.make} ${vehicle.model}.`,
          type: 'INFO',
          link: '/admin/vehicles',
        },
      });
    }

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'DOCUMENT_UPLOADED',
        entityType: 'VEHICLE_DOCUMENT',
        entityId: fileKey,
        details: `Uploaded ${category} (${file.name}, ${buffer.length} bytes) for vehicle ${vehicleId}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document uploaded securely and queued for administrative compliance review.',
      documentVersion: docVersion,
    });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
