import { NextRequest, NextResponse } from 'next/server';
import { getOutputStyle } from '@/lib/customization-manager';
import { getLocalOutputStylesPath } from '@/lib/config';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source'); // 'library' | 'local' | null

    let style;
    let isLocal = false;
    let inLibrary = false;

    if (source === 'library') {
      // Only load from library (repo)
      style = await getOutputStyle(name, false);
      if (style) {
        inLibrary = true;
        // Check if also exists locally
        const localPath = getLocalOutputStylesPath();
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
      style = await getOutputStyle(name, true);
      if (style) {
        isLocal = true;
        // Check if exists in library
        const libraryStyle = await getOutputStyle(name, false);
        if (libraryStyle) {
          inLibrary = true;
        }
      }
    } else {
      // Default behavior: Try repo first, then local
      style = await getOutputStyle(name, false);

      // Check if exists in library (repo)
      if (style) {
        inLibrary = true;
      }

      if (!style) {
        style = await getOutputStyle(name, true);
        isLocal = true;
      }

      // If found in repo, check if also exists locally
      if (!isLocal && style) {
        const localPath = getLocalOutputStylesPath();
        const localFilePath = path.join(localPath, `${name}.md`);

        try {
          await require('fs').promises.access(localFilePath);
          isLocal = true;
        } catch {
          // Not in local
        }
      }
    }

    if (!style) {
      return NextResponse.json({ error: 'Output style not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...style,
      isLocal,
      inLibrary,
    });
  } catch (error) {
    console.error('Error loading output style:', error);
    return NextResponse.json(
      { error: 'Failed to load output style' },
      { status: 500 }
    );
  }
}
