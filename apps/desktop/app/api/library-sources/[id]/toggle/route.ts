import { NextRequest, NextResponse } from 'next/server';
import { loadConfig, updateLibrarySource } from '@agent-helpers/core/config';

/**
 * POST /api/library-sources/[id]/toggle
 * Toggle enable/disable for a library source
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const config = await loadConfig();
    const source = config.librarySources.find(s => s.id === id);

    if (!source) {
      return NextResponse.json(
        { error: 'Library source not found' },
        { status: 404 }
      );
    }

    // Toggle enabled state
    await updateLibrarySource(id, {
      enabled: !source.enabled,
    });

    // Return updated source
    const updatedConfig = await loadConfig();
    const updatedSource = updatedConfig.librarySources.find(s => s.id === id);

    return NextResponse.json(updatedSource);
  } catch (error) {
    console.error('Error toggling library source:', error);
    return NextResponse.json(
      { error: 'Failed to toggle library source' },
      { status: 500 }
    );
  }
}
