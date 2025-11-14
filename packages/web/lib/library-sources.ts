import { LibrarySource, LibraryManifest, CustomizationType } from './types';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { homedir } from 'os';

const execAsync = promisify(exec);

const CACHE_DIR = path.join(homedir(), '.cache', 'agent-helpers', 'sources');

/**
 * Get the cache directory for a library source
 */
export function getSourceCacheDir(source: LibrarySource): string {
  return path.join(CACHE_DIR, source.id);
}

/**
 * Get the directory to read templates from for a source
 */
export function getSourceDirectory(source: LibrarySource): string {
  switch (source.type) {
    case 'bundled':
      return path.join(process.cwd(), 'library');

    case 'git':
    case 'gist':
      return getSourceCacheDir(source);

    case 'local':
      return source.path || '';

    default:
      throw new Error(`Unknown source type: ${source.type}`);
  }
}

/**
 * Sync a library source (clone or pull)
 */
export async function syncSource(source: LibrarySource): Promise<void> {
  if (source.type === 'bundled') {
    // Bundled sources don't need syncing
    return;
  }

  if (source.type === 'local') {
    // Local sources just need to exist
    const exists = await fs.access(source.path!).then(() => true).catch(() => false);
    if (!exists) {
      throw new Error(`Local directory not found: ${source.path}`);
    }
    return;
  }

  const cacheDir = getSourceCacheDir(source);
  const exists = await fs.access(cacheDir).then(() => true).catch(() => false);

  if (source.type === 'git') {
    await syncGitSource(source, cacheDir, exists);
  } else if (source.type === 'gist') {
    await syncGistSource(source, cacheDir, exists);
  }

  // Update last sync time
  source.lastSync = new Date().toISOString();
}

async function syncGitSource(source: LibrarySource, cacheDir: string, exists: boolean): Promise<void> {
  const gitUrl = source.token
    ? source.url!.replace('https://', `https://${source.token}@`)
    : source.url!;

  if (!exists) {
    // Clone
    await fs.mkdir(path.dirname(cacheDir), { recursive: true });
    const branch = source.branch || 'master';
    await execAsync(`git clone --depth 1 --branch ${branch} "${gitUrl}" "${cacheDir}"`).catch(async () => {
      // Try with main if master fails
      await execAsync(`git clone --depth 1 --branch main "${gitUrl}" "${cacheDir}"`);
    });
  } else {
    // Pull
    await execAsync(`cd "${cacheDir}" && git pull`);
  }
}

async function syncGistSource(source: LibrarySource, cacheDir: string, exists: boolean): Promise<void> {
  // GitHub Gists can be cloned like regular repos
  const gistUrl = source.url!;

  if (!exists) {
    await fs.mkdir(path.dirname(cacheDir), { recursive: true });
    await execAsync(`git clone "${gistUrl}" "${cacheDir}"`);
  } else {
    await execAsync(`cd "${cacheDir}" && git pull`);
  }
}

/**
 * Validate library structure
 */
export interface LibraryValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  manifest?: LibraryManifest;
}

export async function validateLibrary(dir: string): Promise<LibraryValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let manifest: LibraryManifest | undefined;

  // Check if directory exists
  const dirExists = await fs.access(dir).then(() => true).catch(() => false);
  if (!dirExists) {
    errors.push(`Directory not found: ${dir}`);
    return { valid: false, errors, warnings };
  }

  // Check for library.json (optional but recommended)
  const manifestPath = path.join(dir, 'library.json');
  const manifestExists = await fs.access(manifestPath).then(() => true).catch(() => false);

  if (manifestExists) {
    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      manifest = JSON.parse(content);

      // Validate manifest structure
      if (!manifest.name) {
        warnings.push('Manifest missing "name" field');
      }
      if (!manifest.version) {
        warnings.push('Manifest missing "version" field');
      }
    } catch (error) {
      errors.push(`Invalid library.json: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    warnings.push('No library.json manifest found (recommended but not required)');
  }

  // Check for standard directories
  const requiredDirs: Array<{ name: string; type: CustomizationType }> = [
    { name: 'skills', type: 'skill' },
    { name: 'commands', type: 'command' },
    { name: 'agents', type: 'agent' },
    { name: 'output-styles', type: 'output-style' },
  ];

  let hasContent = false;

  for (const { name: dirName } of requiredDirs) {
    const dirPath = path.join(dir, dirName);
    const exists = await fs.access(dirPath).then(() => true).catch(() => false);

    if (exists) {
      // Check if directory has content
      const entries = await fs.readdir(dirPath);
      if (entries.length > 0) {
        hasContent = true;
      }
    }
  }

  if (!hasContent) {
    warnings.push('Library appears to be empty (no skills, commands, agents, or output-styles found)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    manifest,
  };
}

/**
 * Get statistics about a library source
 */
export async function getSourceStats(source: LibrarySource): Promise<{
  skills: number;
  commands: number;
  agents: number;
  outputStyles: number;
}> {
  const dir = getSourceDirectory(source);
  const stats = { skills: 0, commands: 0, agents: 0, outputStyles: 0 };

  try {
    // Count skills (directories in skills/)
    const skillsDir = path.join(dir, 'skills');
    if (await fs.access(skillsDir).then(() => true).catch(() => false)) {
      const entries = await fs.readdir(skillsDir, { withFileTypes: true });
      stats.skills = entries.filter(e => e.isDirectory()).length;
    }

    // Count commands (*.md files in commands/)
    const commandsDir = path.join(dir, 'commands');
    if (await fs.access(commandsDir).then(() => true).catch(() => false)) {
      const entries = await fs.readdir(commandsDir);
      stats.commands = entries.filter(e => e.endsWith('.md')).length;
    }

    // Count agents (*.md files in agents/)
    const agentsDir = path.join(dir, 'agents');
    if (await fs.access(agentsDir).then(() => true).catch(() => false)) {
      const entries = await fs.readdir(agentsDir);
      stats.agents = entries.filter(e => e.endsWith('.md')).length;
    }

    // Count output styles (*.md files in output-styles/)
    const outputStylesDir = path.join(dir, 'output-styles');
    if (await fs.access(outputStylesDir).then(() => true).catch(() => false)) {
      const entries = await fs.readdir(outputStylesDir);
      stats.outputStyles = entries.filter(e => e.endsWith('.md')).length;
    }
  } catch (error) {
    console.error('Error getting source stats:', error);
  }

  return stats;
}

/**
 * Remove a library source (delete cache)
 */
export async function removeSource(source: LibrarySource): Promise<void> {
  if (source.type === 'bundled') {
    throw new Error('Cannot remove bundled library');
  }

  if (source.type === 'git' || source.type === 'gist') {
    const cacheDir = getSourceCacheDir(source);
    const exists = await fs.access(cacheDir).then(() => true).catch(() => false);

    if (exists) {
      await fs.rm(cacheDir, { recursive: true, force: true });
    }
  }

  // Local sources are not removed, just disabled
}
