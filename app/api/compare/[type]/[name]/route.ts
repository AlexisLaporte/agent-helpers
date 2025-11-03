import { NextResponse } from 'next/server';
import { compareWithLibrary } from '@/lib/customization-manager';
import type { CustomizationType } from '@/lib/types';

/**
 * GET /api/compare/:type/:name
 * Compare local customization with library version
 */
export async function GET(
  request: Request,
  { params }: { params: { type: string; name: string } }
) {
  try {
    const { type, name } = params;

    // Validate type
    const validTypes: CustomizationType[] = ['skill', 'command', 'agent', 'output-style'];
    if (!validTypes.includes(type as CustomizationType)) {
      return NextResponse.json(
        { error: 'Invalid customization type' },
        { status: 400 }
      );
    }

    const comparison = await compareWithLibrary(type as CustomizationType, name);

    return NextResponse.json({
      name,
      type,
      isModified: comparison.isModified,
      localHash: comparison.localHash,
      libraryHash: comparison.libraryHash,
      hasLocal: comparison.localContent !== null,
      hasLibrary: comparison.libraryContent !== null,
    });
  } catch (error) {
    console.error('Compare error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
