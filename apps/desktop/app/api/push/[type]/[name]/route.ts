import { NextRequest, NextResponse } from 'next/server';
import { compareWithLibrary } from '@/lib/customization-manager';
import { getLocalPath, getLibraryPath } from '@agent-helpers/core/config';
import path from 'path';
import { promises as fs } from 'fs';

type CustomizationType = 'skill' | 'command' | 'agent' | 'output-style';

/**
 * GET: Return diff between local and library versions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; name: string }> }
) {
  try {
    const { type, name } = await params;

    // Validate type
    const validTypes: CustomizationType[] = ['skill', 'command', 'agent', 'output-style'];
    if (!validTypes.includes(type as CustomizationType)) {
      return NextResponse.json({ error: 'Invalid customization type' }, { status: 400 });
    }

    // Get comparison
    const comparison = await compareWithLibrary(type as CustomizationType, name);

    if (!comparison.localContent) {
      return NextResponse.json({ error: 'Local customization not found' }, { status: 404 });
    }

    if (!comparison.libraryContent) {
      return NextResponse.json({ error: 'Library customization not found' }, { status: 404 });
    }

    return NextResponse.json({
      localContent: comparison.localContent,
      libraryContent: comparison.libraryContent,
      isModified: comparison.isModified,
      localHash: comparison.localHash,
      libraryHash: comparison.libraryHash,
    });
  } catch (error) {
    console.error('Error getting diff:', error);
    return NextResponse.json(
      { error: 'Failed to get diff' },
      { status: 500 }
    );
  }
}

/**
 * POST: Push local version to library
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; name: string }> }
) {
  try {
    const { type, name } = await params;

    // Validate type
    const validTypes: CustomizationType[] = ['skill', 'command', 'agent', 'output-style'];
    if (!validTypes.includes(type as CustomizationType)) {
      return NextResponse.json({ error: 'Invalid customization type' }, { status: 400 });
    }

    const customizationType = type as CustomizationType;

    // Get local and library paths
    const localBasePath = getLocalPath(customizationType);
    const libraryBasePath = getLibraryPath(customizationType);

    if (customizationType === 'skill') {
      // For skills, copy entire directory
      const localSkillPath = path.join(localBasePath, name);
      const librarySkillPath = path.join(libraryBasePath, name);

      // Check if local skill exists
      try {
        await fs.access(localSkillPath);
      } catch {
        return NextResponse.json({ error: 'Local skill not found' }, { status: 404 });
      }

      // Ensure library directory exists
      await fs.mkdir(libraryBasePath, { recursive: true });

      // Remove existing library version if it exists
      try {
        await fs.rm(librarySkillPath, { recursive: true, force: true });
      } catch {
        // Ignore if doesn't exist
      }

      // Copy entire directory recursively
      await copyDirectory(localSkillPath, librarySkillPath);
    } else {
      // For commands, agents, output-styles, copy single .md file
      const localFilePath = path.join(localBasePath, `${name}.md`);
      const libraryFilePath = path.join(libraryBasePath, `${name}.md`);

      // Check if local file exists
      try {
        await fs.access(localFilePath);
      } catch {
        return NextResponse.json({ error: 'Local customization not found' }, { status: 404 });
      }

      // Ensure library directory exists
      await fs.mkdir(libraryBasePath, { recursive: true });

      // Copy file
      await fs.copyFile(localFilePath, libraryFilePath);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully pushed ${type} "${name}" to library`,
    });
  } catch (error) {
    console.error('Error pushing to library:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to push to library' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to copy directory recursively
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Helper functions to get paths
 */
function getLocalPath(type: CustomizationType): string {
  const homedir = require('os').homedir();
  const basePath = path.join(homedir, '.claude');

  switch (type) {
    case 'skill':
      return path.join(basePath, 'skills');
    case 'command':
      return path.join(basePath, 'commands');
    case 'agent':
      return path.join(basePath, 'agents');
    case 'output-style':
      return path.join(basePath, 'output-styles');
  }
}

function getLibraryPath(type: CustomizationType): string {
  const libraryBase = path.join(process.cwd(), 'library');

  switch (type) {
    case 'skill':
      return path.join(libraryBase, 'skills');
    case 'command':
      return path.join(libraryBase, 'commands');
    case 'agent':
      return path.join(libraryBase, 'agents');
    case 'output-style':
      return path.join(libraryBase, 'output-styles');
  }
}
