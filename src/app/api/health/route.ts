export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { checkPostgresConnection } from '@/lib/db';
import { documentStorage } from '@/lib/documentStorage';
import { monitoring } from '@/lib/monitoring';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let dbConnected = false;

  try {
    dbConnected = await checkPostgresConnection();
  } catch {
    dbConnected = false;
  }

  const responseTimeMs = Date.now() - startTime;
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '0.2.0-phase6',
    responseTimeMs,
    services: {
      database: {
        mode: dbConnected ? 'POSTGRESQL_PERSISTENT' : 'IN_MEMORY_DUAL_MODE_FALLBACK',
        connected: dbConnected,
      },
      storage: {
        provider: documentStorage.providerName,
        status: 'READY',
      },
      paymentGateway: {
        mode: (process.env.PAYMENT_MODE || 'mock').toUpperCase(),
        environment: 'TEST_MODE_ONLY',
      },
      notifications: {
        emailProvider: process.env.RESEND_API_KEY ? 'RESEND' : process.env.SMTP_HOST ? 'SMTP' : 'MOCK_CONSOLE',
      },
    },
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    },
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Health-Check': 'PASS',
    },
  });
}
