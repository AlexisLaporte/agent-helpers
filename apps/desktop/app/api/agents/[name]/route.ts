import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/customization-manager';
import { getLocalAgentsPath } from '@agent-helpers/core/config';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source'); // 'library' | 'local' | null

    let agent;
    let isLocal = false;
    let inLibrary = false;

    if (source === 'library') {
      // Only load from library (repo)
      agent = await getAgent(name, false);
      if (agent) {
        inLibrary = true;
        // Check if also exists locally
        const localPath = getLocalAgentsPath();
        const localFilePath = path.join(localPath, `${name}.md`);
        try {
          await require('fs').promises.access(localFilePath);
          isLocal = true;
        } catch {
          // Not in local
        }
      }
    } else if (source === 'local') {
      // Only load from local
      agent = await getAgent(name, true);
      if (agent) {
        isLocal = true;
        // Check if exists in library
        const libraryAgent = await getAgent(name, false);
        if (libraryAgent) {
          inLibrary = true;
        }
      }
    } else {
      // Default behavior: Try repo first, then local
      agent = await getAgent(name, false);

      // Check if exists in library (repo)
      if (agent) {
        inLibrary = true;
      }

      if (!agent) {
        agent = await getAgent(name, true);
        isLocal = true;
      }

      // If found in repo, check if also exists locally
      if (!isLocal && agent) {
        const localPath = getLocalAgentsPath();
        const localFilePath = path.join(localPath, `${name}.md`);

        try {
          await require('fs').promises.access(localFilePath);
          isLocal = true;
        } catch {
          // Not in local
        }
      }
    }

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...agent,
      isLocal,
      inLibrary,
    });
  } catch (error) {
    console.error('Error loading agent:', error);
    return NextResponse.json(
      { error: 'Failed to load agent' },
      { status: 500 }
    );
  }
}
