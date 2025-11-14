import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getClaudeBasePath } from '@agent-helpers/core/config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');
    const basePath = searchParams.get('basePath');

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    const claudeBase = getClaudeBasePath(basePath || undefined);
    const fullPath = path.join(claudeBase, filePath);

    // Security check: ensure path is within .claude directory
    if (!fullPath.startsWith(claudeBase)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    const stats = await fs.stat(fullPath);

    // Files successfully loaded from .claude directory are always local
    // (library/repo files are not accessible through this API)
    const isLocal = true;

    return NextResponse.json({
      path: filePath,
      content,
      lastModified: stats.mtime.toISOString(),
      size: stats.size,
      isLocal,
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    console.error('Error reading config file:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: filePath, content, basePath } = body;

    if (!filePath || content === undefined) {
      return NextResponse.json({ error: 'File path and content are required' }, { status: 400 });
    }

    const claudeBase = getClaudeBasePath(basePath || undefined);
    const fullPath = path.join(claudeBase, filePath);

    // Security check: ensure path is within .claude directory
    if (!fullPath.startsWith(claudeBase)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    await fs.writeFile(fullPath, content, 'utf-8');

    // For shell scripts, ensure they're executable
    if (fullPath.endsWith('.sh')) {
      await fs.chmod(fullPath, 0o755);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing config file:', error);
    return NextResponse.json({ error: 'Failed to write file' }, { status: 500 });
  }
}
