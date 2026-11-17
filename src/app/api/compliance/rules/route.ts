export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const rules = await db.complianceRule.findMany();
  const versions = await db.complianceRuleVersion.findMany();
  return NextResponse.json({ rules, versions });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || !user.roles.includes('ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Compliance Manager or Admin role required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      ruleId,
      jurisdictionState,
      jurisdictionCity,
      vehicleCategory,
      rentalModel,
      ownerCategory = 'INDIVIDUAL',
      requiredDocuments,
      requiredPermits,
      sourceReference,
      reviewerNotes,
      status = 'ACTIVE',
      changeSummary = 'Updated compliance parameters',
    } = body;

    const existing = await db.complianceRule.findUnique({ where: { ruleId } });

    if (existing) {
      const nextVersion = (existing.version || 1) + 1;
      const updated = await db.complianceRule.update({
        where: { ruleId },
        data: {
          jurisdictionState,
          jurisdictionCity: jurisdictionCity || null,
          vehicleCategory,
          rentalModel,
          ownerCategory,
          requiredDocuments,
          requiredPermits: requiredPermits || null,
          sourceReference: sourceReference || existing.sourceReference,
          reviewerNotes: reviewerNotes || existing.reviewerNotes,
          status,
          version: nextVersion,
        },
      });

      // Record Version Audit
      await db.complianceRuleVersion.create({
        data: {
          ruleId: existing.id,
          version: nextVersion,
          changeSummary,
          changedBy: user.id,
          snapshot: JSON.stringify(updated),
        },
      });

      return NextResponse.json({ success: true, rule: updated });
    } else {
      const created = await db.complianceRule.create({
        data: {
          ruleId: ruleId || `RULE-${Date.now().toString().slice(-6)}`,
          jurisdictionState: jurisdictionState || 'KARNATAKA',
          jurisdictionCity: jurisdictionCity || null,
          vehicleCategory: vehicleCategory || 'CAR',
          rentalModel: rentalModel || 'SELF_DRIVE',
          ownerCategory,
          requiredDocuments: requiredDocuments || 'RC,INSURANCE,PUC',
          requiredPermits: requiredPermits || null,
          sourceReference: sourceReference || 'Motor Vehicles Act 1988',
          reviewerNotes: reviewerNotes || null,
          status,
          version: 1,
        },
      });

      await db.complianceRuleVersion.create({
        data: {
          ruleId: created.id,
          version: 1,
          changeSummary: 'Initial rule creation',
          changedBy: user.id,
          snapshot: JSON.stringify(created),
        },
      });

      return NextResponse.json({ success: true, rule: created });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update compliance rule' }, { status: 500 });
  }
}
