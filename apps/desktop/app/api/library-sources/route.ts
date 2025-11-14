import { NextRequest, NextResponse } from 'next/server';
import { loadConfig, saveConfig, addLibrarySource as addSourceToConfig, removeLibrarySource as removeSourceFromConfig } from '@agent-helpers/core/config';
import { parseLibraryInput } from '@agent-helpers/core/library-parser';
import { syncSource, validateLibrary, getSourceDirectory, getSourceStats, removeSource } from '@agent-helpers/core/library-sources';

/**
 * GET /api/library-sources
 * Get all library sources
 */
export async function GET() {
  try {
    const config = await loadConfig();

    // Enrich sources with stats if they're already synced
    const sourcesWithStats = await Promise.all(
      config.librarySources.map(async (source) => {
        try {
          const stats = await getSourceStats(source);
          return { ...source, stats };
        } catch (error) {
          // Source not yet synced or invalid
          return source;
        }
      })
    );

    return NextResponse.json(sourcesWithStats);
  } catch (error) {
    console.error('Error fetching library sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library sources' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/library-sources
 * Add a new library source
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Missing "input" field' },
        { status: 400 }
      );
    }

    // Parse the input
    const source = parseLibraryInput(input);

    // Validate the library structure (sync first if needed)
    if (source.type !== 'bundled') {
      try {
        await syncSource(source);
        const sourceDir = getSourceDirectory(source);
        const validation = await validateLibrary(sourceDir);

        if (!validation.valid) {
          return NextResponse.json(
            {
              error: 'Invalid library structure',
              details: validation.errors,
              warnings: validation.warnings,
            },
            { status: 400 }
          );
        }

        // Get stats
        const stats = await getSourceStats(source);
        source.stats = stats;

        // Update lastSync
        source.lastSync = new Date().toISOString();
      } catch (syncError) {
        return NextResponse.json(
          {
            error: 'Failed to sync library',
            details: syncError instanceof Error ? syncError.message : String(syncError),
          },
          { status: 500 }
        );
      }
    }

    // Add to config
    await addSourceToConfig(source);

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error('Error adding library source:', error);
    return NextResponse.json(
      {
        error: 'Failed to add library source',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/library-sources?id=xxx
 * Remove a library source
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('id');

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Missing "id" parameter' },
        { status: 400 }
      );
    }

    // Don't allow removing bundled source
    if (sourceId === 'bundled') {
      return NextResponse.json(
        { error: 'Cannot remove bundled library' },
        { status: 403 }
      );
    }

    const config = await loadConfig();
    const source = config.librarySources.find(s => s.id === sourceId);

    if (!source) {
      return NextResponse.json(
        { error: 'Library source not found' },
        { status: 404 }
      );
    }

    // Remove cache/files
    await removeSource(source);

    // Remove from config
    await removeSourceFromConfig(sourceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing library source:', error);
    return NextResponse.json(
      { error: 'Failed to remove library source' },
      { status: 500 }
    );
  }
}
