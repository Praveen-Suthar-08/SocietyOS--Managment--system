import { NextResponse } from 'next/server';
import { unitService } from '@/server/services/unit-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const societyId = searchParams.get('societyId') || 'default-society';

    const vacancies = await unitService.getPublicVacancies(societyId);
    return NextResponse.json(vacancies);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch public vacancies';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
