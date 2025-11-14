import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { homedir } from 'os';

const getClaudeMdPath = (projectPath?: string) => {
  if (projectPath) {
    return path.join(projectPath, 'CLAUDE.md');
  }
  return path.join(homedir(), '.claude', 'CLAUDE.md');
};

/**
 * GET /api/claude-md
 * Read CLAUDE.md file
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectPath = searchParams.get('project') || undefined;
    const filePath = getClaudeMdPath(projectPath);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return NextResponse.json({
        content,
        path: filePath,
        exists: true,
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({
          content: '',
          path: filePath,
          exists: false,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error reading CLAUDE.md:', error);
    return NextResponse.json(
      { error: 'Failed to read CLAUDE.md' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/claude-md
 * Write CLAUDE.md file
 */
export async function POST(request: NextRequest) {
  try {
    const { content, project } = await request.json();
    const filePath = getClaudeMdPath(project);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write file
    await fs.writeFile(filePath, content, 'utf-8');

    return NextResponse.json({
      success: true,
      path: filePath,
    });
  } catch (error) {
    console.error('Error writing CLAUDE.md:', error);
    return NextResponse.json(
      { error: 'Failed to write CLAUDE.md' },
      { status: 500 }
    );
  }
}
