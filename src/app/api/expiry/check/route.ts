import { NextResponse } from 'next/server';
import { scanExpiringDocuments } from '@/lib/expiryManager';

export async function GET() {
  try {
    const alerts = await scanExpiringDocuments();
    return NextResponse.json({
      success: true,
      totalAlerts: alerts.length,
      alerts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to scan expiring documents' }, { status: 500 });
  }
}
