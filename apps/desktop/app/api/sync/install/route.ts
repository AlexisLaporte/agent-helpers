import { NextResponse } from 'next/server';
import { syncToLocal } from '@/lib/customization-manager';
import type { CustomizationType } from '@agent-helpers/core/types';

/**
 * POST /api/sync/install
 * Install a customization from library to local ~/.claude/
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name } = body as { type: CustomizationType; name: string };

    if (!type || !name) {
      return NextResponse.json(
        { error: 'Missing type or name' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes: CustomizationType[] = ['skill', 'command', 'agent', 'output-style'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid customization type' },
        { status: 400 }
      );
    }

    const result = await syncToLocal(type, name);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to sync customization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully installed ${type} "${name}" to local`
    });
  } catch (error) {
    console.error('Sync install error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
