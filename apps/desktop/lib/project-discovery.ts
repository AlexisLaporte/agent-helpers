import { promises as fs } from 'fs';
import path from 'path';
import { homedir } from 'os';
import type { ClaudeProject } from '@agent-helpers/core/types';

/**
 * Search for .claude directories recursively
 */
async function findClaudeDirectories(
  searchPath: string,
  maxDepth: number = 5,
  currentDepth: number = 0
): Promise<string[]> {
  const claudeDirs: string[] = [];

  if (currentDepth >= maxDepth) {
    return claudeDirs;
  }

  try {
    const entries = await fs.readdir(searchPath, { withFileTypes: true });

    for (const entry of entries) {
      // Skip hidden directories except .claude
      if (entry.name.startsWith('.') && entry.name !== '.claude') {
        continue;
      }

      // Skip common large directories
      if (['node_modules', '.git', 'dist', 'build', '.next', 'target', 'vendor'].includes(entry.name)) {
        continue;
      }

      const fullPath = path.join(searchPath, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === '.claude') {
          claudeDirs.push(fullPath);
        } else {
          // Recurse into subdirectories
          const subDirs = await findClaudeDirectories(fullPath, maxDepth, currentDepth + 1);
          claudeDirs.push(...subDirs);
        }
      }
    }
  } catch (error) {
    // Silently skip directories we can't read (permissions, etc.)
  }

  return claudeDirs;
}

/**
 * Count customizations in a .claude directory
 */
async function countCustomizations(claudePath: string): Promise<{
  skills: number;
  commands: number;
  agents: number;
  outputStyles: number;
  hooks: number;
}> {
  const counts = {
    skills: 0,
    commands: 0,
    agents: 0,
    outputStyles: 0,
    hooks: 0,
  };

  try {
    // Count skills (directories)
    const skillsPath = path.join(claudePath, 'skills');
    try {
      const skillEntries = await fs.readdir(skillsPath, { withFileTypes: true });
      counts.skills = skillEntries.filter(e => e.isDirectory() && !e.name.startsWith('.')).length;
    } catch {
      // Directory doesn't exist
    }

    // Count commands (.md files)
    const commandsPath = path.join(claudePath, 'commands');
    try {
      const commandEntries = await fs.readdir(commandsPath, { withFileTypes: true });
      counts.commands = commandEntries.filter(e => e.isFile() && e.name.endsWith('.md')).length;
    } catch {
      // Directory doesn't exist
    }

    // Count agents (.md files)
    const agentsPath = path.join(claudePath, 'agents');
    try {
      const agentEntries = await fs.readdir(agentsPath, { withFileTypes: true });
      counts.agents = agentEntries.filter(e => e.isFile() && e.name.endsWith('.md')).length;
    } catch {
      // Directory doesn't exist
    }

    // Count output styles (.md files)
    const stylesPath = path.join(claudePath, 'output-styles');
    try {
      const styleEntries = await fs.readdir(stylesPath, { withFileTypes: true });
      counts.outputStyles = styleEntries.filter(e => e.isFile() && e.name.endsWith('.md')).length;
    } catch {
      // Directory doesn't exist
    }

    // Count hooks (.sh files and executables)
    const hooksPath = path.join(claudePath, 'hooks');
    try {
      const hookEntries = await fs.readdir(hooksPath, { withFileTypes: true });
      counts.hooks = hookEntries.filter(e => e.isFile() && (e.name.endsWith('.sh') || !e.name.startsWith('.'))).length;
    } catch {
      // Directory doesn't exist
    }
  } catch (error) {
    // Error counting, return zeros
  }

  return counts;
}

/**
 * Get project info from a .claude directory
 */
async function getProjectInfo(claudePath: string): Promise<ClaudeProject> {
  const projectPath = path.dirname(claudePath);
  const projectName = projectPath === homedir() ? 'Home (~/.claude)' : path.basename(projectPath);

  // Get last modified time
  let lastModified = new Date();
  try {
    const stats = await fs.stat(claudePath);
    lastModified = stats.mtime;
  } catch {
    // Use current time if stat fails
  }

  // Check if settings.json exists
  let hasSettings = false;
  try {
    await fs.access(path.join(claudePath, 'settings.json'));
    hasSettings = true;
  } catch {
    // No settings file
  }

  // Check if statusline.sh exists
  let hasStatusline = false;
  try {
    await fs.access(path.join(claudePath, 'statusline.sh'));
    hasStatusline = true;
  } catch {
    // No statusline file
  }

  // Count customizations
  const customizationCounts = await countCustomizations(claudePath);

  return {
    name: projectName,
    path: projectPath,
    claudePath,
    lastModified,
    hasSettings,
    hasStatusline,
    customizationCounts,
  };
}

/**
 * Discover all Claude Code projects
 */
export async function discoverProjects(searchPaths: string[] = []): Promise<ClaudeProject[]> {
  const defaultSearchPaths = [
    homedir(), // Always search home
    '/data/dev', // Common dev directory (customize as needed)
    '/data/assistants', // Assistants directory
    path.join(homedir(), 'projects'),
    path.join(homedir(), 'workspace'),
    path.join(homedir(), 'code'),
  ];

  // Combine default and custom search paths
  const allSearchPaths = [...new Set([...defaultSearchPaths, ...searchPaths])];

  // Find all .claude directories
  const claudeDirs: string[] = [];
  for (const searchPath of allSearchPaths) {
    try {
      await fs.access(searchPath);
      const found = await findClaudeDirectories(searchPath);
      claudeDirs.push(...found);
    } catch {
      // Skip paths that don't exist
    }
  }

  // Get project info for each .claude directory
  const projects = await Promise.all(claudeDirs.map(dir => getProjectInfo(dir)));

  // Sort by last modified (most recent first)
  return projects.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
}

/**
 * Get single project info by path
 */
export async function getProjectByPath(claudePath: string): Promise<ClaudeProject | null> {
  try {
    await fs.access(claudePath);
    return await getProjectInfo(claudePath);
  } catch {
    return null;
  }
}
