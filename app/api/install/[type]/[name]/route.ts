import { NextRequest, NextResponse } from 'next/server';
import { syncToLocal } from '@/lib/customization-manager';
import type { CustomizationType } from '@/lib/types';

// POST - Install a template from library to local
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; name: string }> }
) {
  try {
    const { type, name } = await params;

    // Validate type
    const validTypes: CustomizationType[] = ['skill', 'command', 'agent', 'output-style'];
    if (!validTypes.includes(type as CustomizationType)) {
      return NextResponse.json(
        { error: 'Invalid customization type' },
        { status: 400 }
      );
    }

    // Install the customization
    const result = await syncToLocal(type as CustomizationType, name);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully installed ${type} "${name}"`,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Installation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to install customization:', error);
    return NextResponse.json(
      { error: 'Failed to install customization' },
      { status: 500 }
    );
  }
}
