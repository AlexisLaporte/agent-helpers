import { NextRequest, NextResponse } from 'next/server';
import { listLocalCommands } from '@/lib/customization-manager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectPath = searchParams.get('project') || undefined;

    const commands = await listLocalCommands(projectPath);

    return NextResponse.json(commands);
  } catch (error) {
    console.error('Error fetching local commands:', error);
    return NextResponse.json(
      { error: 'Failed to load local commands' },
      { status: 500 }
    );
  }
}
