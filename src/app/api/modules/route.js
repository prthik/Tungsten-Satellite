import { NextResponse } from 'next/server';
import { getModulesForPlanOption } from './sqlite';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const planOptionId = searchParams.get('plan_option_id') || '1';
    const modules = await getModulesForPlanOption(planOptionId);
    return NextResponse.json({ modules });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
