import { NextRequest, NextResponse } from 'next/server';
import { listLocalAgents } from '@agent-helpers/core/customization-manager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectPath = searchParams.get('project') || undefined;

    const agents = await listLocalAgents(projectPath);

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching local agents:', error);
    return NextResponse.json(
      { error: 'Failed to load local agents' },
      { status: 500 }
    );
  }
}
