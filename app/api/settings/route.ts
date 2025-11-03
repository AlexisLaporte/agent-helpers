import { NextRequest, NextResponse } from 'next/server';
import { readSettings, writeSettings } from '@/lib/customization-manager';

// GET - Read settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isLocal = searchParams.get('local') === 'true';

    const settings = await readSettings(isLocal);

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings file not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to read settings:', error);
    return NextResponse.json(
      { error: 'Failed to read settings' },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isLocal = searchParams.get('local') === 'true';
    const settings = await request.json();

    await writeSettings(settings, isLocal);

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
