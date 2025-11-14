import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getTypeConfig } from '@agent-helpers/core/customization-config';
import { getClaudeBasePath } from '@agent-helpers/core/config';

/**
 * Unified API for managing all types of customization files
 * Supports: skills, commands, agents, output-styles, settings, statusline, hooks
 */

// DELETE - Remove file/directory completely
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; name: string }> }
) {
  try {
    const { type, name } = await params;
    const searchParams = request.nextUrl.searchParams;
    const basePath = searchParams.get('basePath') || undefined;

    // Validate type
    const config = getTypeConfig(type);
    if (!config) {
      return NextResponse.json(
        { error: `Invalid type: ${type}` },
        { status: 400 }
      );
    }

    if (!config.allowDelete) {
      return NextResponse.json(
        { error: `Deleting ${config.displayName} is not allowed` },
        { status: 403 }
      );
    }

    // Construct file/directory path
    const claudeBase = getClaudeBasePath(basePath);
    let targetPath: string;

    if (config.isDirectory) {
      targetPath = path.join(claudeBase, config.basePath, name);
    } else {
      const fileName = config.fileExtension ? `${name}${config.fileExtension}` : name;
      targetPath = config.basePath
        ? path.join(claudeBase, config.basePath, fileName)
        : path.join(claudeBase, fileName);
    }

    // Check if exists
    try {
      await fs.access(targetPath);
    } catch {
      return NextResponse.json(
        { error: `${config.displayName} not found` },
        { status: 404 }
      );
    }

    // Delete
    if (config.isDirectory) {
      await fs.rm(targetPath, { recursive: true, force: true });
    } else {
      await fs.rm(targetPath, { force: true });
    }

    return NextResponse.json({
      success: true,
      message: `${config.displayName} deleted successfully`,
    });
  } catch (error) {
    console.error('Failed to delete:', error);
    return NextResponse.json(
      { error: 'Failed to delete file/directory' },
      { status: 500 }
    );
  }
}

// POST - Archive/Unarchive by renaming with prefix
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; name: string }> }
) {
  try {
    const { type, name } = await params;
    const searchParams = request.nextUrl.searchParams;
    const basePath = searchParams.get('basePath') || undefined;
    const { action } = await request.json();

    if (action !== 'archive' && action !== 'unarchive') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "archive" or "unarchive"' },
        { status: 400 }
      );
    }

    // Validate type
    const config = getTypeConfig(type);
    if (!config) {
      return NextResponse.json(
        { error: `Invalid type: ${type}` },
        { status: 400 }
      );
    }

    if (!config.allowArchive) {
      return NextResponse.json(
        { error: `Archiving ${config.displayName} is not allowed` },
        { status: 403 }
      );
    }

    const claudeBase = getClaudeBasePath(basePath);

    // Construct paths
    let currentPath: string;
    let targetPath: string;

    if (config.isDirectory) {
      const baseDir = path.join(claudeBase, config.basePath);
      currentPath = path.join(baseDir, action === 'archive' ? name : `${config.archivePrefix}${name}`);
      targetPath = path.join(baseDir, action === 'archive' ? `${config.archivePrefix}${name}` : name);
    } else {
      const fileName = config.fileExtension ? `${name}${config.fileExtension}` : name;
      const archivedFileName = config.fileExtension
        ? `${config.archivePrefix}${name}${config.fileExtension}`
        : `${config.archivePrefix}${name}`;

      const baseDir = config.basePath ? path.join(claudeBase, config.basePath) : claudeBase;

      currentPath = path.join(baseDir, action === 'archive' ? fileName : archivedFileName);
      targetPath = path.join(baseDir, action === 'archive' ? archivedFileName : fileName);
    }

    // Check if source exists
    try {
      await fs.access(currentPath);
    } catch {
      const notFoundType = action === 'archive' ? config.displayName : `Archived ${config.displayName}`;
      return NextResponse.json(
        { error: `${notFoundType} not found` },
        { status: 404 }
      );
    }

    // Rename to archive/unarchive
    await fs.rename(currentPath, targetPath);

    const message = action === 'archive'
      ? `${config.displayName} archived successfully`
      : `${config.displayName} restored successfully`;

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Failed to archive/unarchive:', error);
    return NextResponse.json(
      { error: 'Failed to archive/unarchive file/directory' },
      { status: 500 }
    );
  }
}
