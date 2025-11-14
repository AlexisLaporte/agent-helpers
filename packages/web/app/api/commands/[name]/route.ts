import { NextRequest, NextResponse } from 'next/server';
import { getCommand } from '@/lib/customization-manager';
import { getLocalCommandsPath } from '@/lib/config';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source'); // 'library' | 'local' | null

    let command;
    let isLocal = false;
    let inLibrary = false;

    if (source === 'library') {
      // Only load from library (repo)
      command = await getCommand(name, false);
      if (command) {
        inLibrary = true;
        // Check if also exists locally
        const localPath = getLocalCommandsPath();
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
      command = await getCommand(name, true);
      if (command) {
        isLocal = true;
        // Check if exists in library
        const libraryCommand = await getCommand(name, false);
        if (libraryCommand) {
          inLibrary = true;
        }
      }
    } else {
      // Default behavior: Try repo first, then local
      command = await getCommand(name, false);

      // Check if exists in library (repo)
      if (command) {
        inLibrary = true;
      }

      if (!command) {
        command = await getCommand(name, true);
        isLocal = true;
      }

      // If found in repo, check if also exists locally
      if (!isLocal && command) {
        const localPath = getLocalCommandsPath();
        const localFilePath = path.join(localPath, `${name}.md`);

        try {
          await require('fs').promises.access(localFilePath);
          isLocal = true;
        } catch {
          // Not in local
        }
      }
    }

    if (!command) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...command,
      isLocal,
      inLibrary,
    });
  } catch (error) {
    console.error('Error loading command:', error);
    return NextResponse.json(
      { error: 'Failed to load command' },
      { status: 500 }
    );
  }
}
