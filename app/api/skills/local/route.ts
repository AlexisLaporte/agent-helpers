import { NextRequest, NextResponse } from 'next/server';
import { listLocalSkills } from '@/lib/customization-manager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectPath = searchParams.get('project') || undefined;

    const skills = await listLocalSkills(projectPath);

    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching local skills:', error);
    return NextResponse.json(
      { error: 'Failed to load local skills' },
      { status: 500 }
    );
  }
}
