import { NextRequest, NextResponse } from 'next/server';
import { listLocalOutputStyles } from '@/lib/customization-manager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectPath = searchParams.get('project') || undefined;

    const outputStyles = await listLocalOutputStyles(projectPath);

    return NextResponse.json(outputStyles);
  } catch (error) {
    console.error('Error fetching local output styles:', error);
    return NextResponse.json(
      { error: 'Failed to load local output styles' },
      { status: 500 }
    );
  }
}
