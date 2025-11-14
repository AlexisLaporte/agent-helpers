import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function GET() {
  try {
    const homePath = path.join(os.homedir(), '.claude');

    // Check if .claude directory exists
    try {
      await fs.access(homePath);
    } catch {
      return NextResponse.json({
        files: [],
        path: homePath,
        message: '.claude directory not found'
      });
    }

    // Read directory contents
    const entries = await fs.readdir(homePath, { withFileTypes: true });

    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(homePath, entry.name);
        const stats = await fs.stat(fullPath);

        return {
          name: entry.name,
          path: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
      })
    );

    // Sort: directories first, then by name
    files.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      files,
      path: homePath
    });
  } catch (error) {
    console.error('Error reading home directory:', error);
    return NextResponse.json(
      { error: 'Failed to read home directory' },
      { status: 500 }
    );
  }
}
