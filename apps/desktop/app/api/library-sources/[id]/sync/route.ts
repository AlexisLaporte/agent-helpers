import { NextRequest, NextResponse } from 'next/server';
import { loadConfig, updateLibrarySource } from '@agent-helpers/core/config';
import { syncSource, getSourceStats } from '@/lib/library-sources';

/**
 * POST /api/library-sources/[id]/sync
 * Sync a specific library source
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

    if (source.type === 'bundled') {
      return NextResponse.json(
        { error: 'Bundled library does not need syncing' },
        { status: 400 }
      );
    }

    // Sync the source
    await syncSource(source);

    // Update stats and lastSync
    const stats = await getSourceStats(source);
    await updateLibrarySource(id, {
      lastSync: new Date().toISOString(),
      stats,
    });

    // Return updated source
    const updatedConfig = await loadConfig();
    const updatedSource = updatedConfig.librarySources.find(s => s.id === id);

    return NextResponse.json(updatedSource);
  } catch (error) {
    console.error('Error syncing library source:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync library source',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
