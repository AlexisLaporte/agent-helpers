import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import type {
  Skill,
  Command,
  Agent,
  OutputStyle,
  SkillMetadata,
  CommandMetadata,
  AgentMetadata,
  OutputStyleMetadata,
  CustomizationType,
  Settings,
} from './types';
import {
  getLocalSkillsPath,
  getLocalCommandsPath,
  getLocalAgentsPath,
  getLocalOutputStylesPath,
} from './config';

const SKILLS_REPO_PATH = path.join(process.cwd(), 'library', 'skills');
const COMMANDS_REPO_PATH = path.join(process.cwd(), 'library', 'commands');
const AGENTS_REPO_PATH = path.join(process.cwd(), 'library', 'agents');
const OUTPUT_STYLES_REPO_PATH = path.join(process.cwd(), 'library', 'output-styles');

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): { metadata: Record<string, any>; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, body: content };
  }

  const frontmatter = match[1];
  const body = match[2];
  const metadata: Record<string, any> = {};

  // Parse YAML-like frontmatter
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      metadata[key] = value;
    }
  }

  return { metadata, body };
}

/**
 * Parse SKILL.md frontmatter to extract metadata
 */
function parseSkillMetadata(content: string): SkillMetadata {
  const { metadata } = parseFrontmatter(content);

  return {
    name: metadata.name || 'Unknown',
    description: metadata.description || 'No description available',
  };
}

/**
 * Parse command .md file to extract metadata
 */
function parseCommandMetadata(content: string): CommandMetadata {
  const { metadata } = parseFrontmatter(content);

  return {
    name: metadata.name || 'Unknown',
    description: metadata.description || 'No description available',
    allowedTools: metadata['allowed-tools'],
    argumentHint: metadata['argument-hint'],
    model: metadata.model,
  };
}

/**
 * Parse agent .md file to extract metadata
 */
function parseAgentMetadata(content: string): AgentMetadata {
  const { metadata } = parseFrontmatter(content);

  return {
    name: metadata.name || 'Unknown',
    description: metadata.description || 'No description available',
    tools: metadata.tools ? metadata.tools.split(',').map((t: string) => t.trim()) : undefined,
    model: metadata.model,
  };
}

/**
 * Parse output style .md file to extract metadata
 */
function parseOutputStyleMetadata(content: string): OutputStyleMetadata {
  const { metadata } = parseFrontmatter(content);

  return {
    name: metadata.name || 'Unknown',
    description: metadata.description || 'No description available',
  };
}

/**
 * Determine if a path is a personal customization
 */
function isPersonalPath(filePath: string): boolean {
  const basename = path.basename(filePath);
  const dirname = path.dirname(filePath);

  // Check if filename ends with .personal.md
  if (basename.endsWith('.personal.md')) {
    return true;
  }

  // Check if in a personal/ subdirectory
  if (dirname.includes('/personal') || dirname.includes('\\personal')) {
    return true;
  }

  return false;
}

/**
 * Determine the source of a customization
 */
function getCustomizationSource(
  name: string,
  isLocal: boolean,
  frontmatterSource?: string
): 'base' | 'org' | 'local' {
  // If source is explicitly set in frontmatter, use that
  if (frontmatterSource) {
    if (frontmatterSource === 'base' || frontmatterSource === 'org' || frontmatterSource === 'local') {
      return frontmatterSource;
    }
  }

  // If it's a personal/local customization
  if (isLocal) {
    return 'local';
  }

  if (isPersonalPath(name)) {
    return 'local';
  }

  // Check if it has an organization prefix (e.g., 321-)
  if (/^[a-z0-9]+-/.test(name)) {
    return 'org';
  }

  return 'base';
}

/**
 * Read a single skill directory
 */
async function readSkill(skillPath: string, isLocal = false): Promise<Skill | null> {
  const skillMdPath = path.join(skillPath, 'SKILL.md');

  try {
    const content = await fs.readFile(skillMdPath, 'utf-8');
    const { metadata: rawMetadata } = parseFrontmatter(content);
    const metadata = parseSkillMetadata(content);
    const skillName = path.basename(skillPath);
    const isPersonal = isPersonalPath(skillPath);
    const source = getCustomizationSource(skillName, isLocal, rawMetadata.source);

    return {
      type: 'skill',
      name: skillName,
      description: metadata.description,
      path: skillPath,
      content,
      isLocal,
      isArchived: false,
      isPersonal,
      isTemplate: !isLocal,
      source,
    };
  } catch (error) {
    // Silently return null for missing skills (expected behavior)
    return null;
  }
}

/**
 * Read a single command file
 */
async function readCommand(commandPath: string, isLocal = false): Promise<Command | null> {
  try {
    const content = await fs.readFile(commandPath, 'utf-8');
    const { metadata: rawMetadata } = parseFrontmatter(content);
    const metadata = parseCommandMetadata(content);
    const commandName = path.basename(commandPath, '.md');
    const isPersonal = isPersonalPath(commandPath);
    const source = getCustomizationSource(commandName, isLocal, rawMetadata.source);

    return {
      type: 'command',
      name: commandName,
      description: metadata.description,
      path: commandPath,
      content,
      isLocal,
      isArchived: false,
      isPersonal,
      isTemplate: !isLocal,
      source,
      allowedTools: metadata.allowedTools,
      argumentHint: metadata.argumentHint,
      model: metadata.model,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Read a single agent file
 */
async function readAgent(agentPath: string, isLocal = false): Promise<Agent | null> {
  try {
    const content = await fs.readFile(agentPath, 'utf-8');
    const { metadata, body } = parseFrontmatter(content);
    const agentMetadata = parseAgentMetadata(content);
    const agentName = path.basename(agentPath, '.md');
    const isPersonal = isPersonalPath(agentPath);
    const source = getCustomizationSource(agentName, isLocal, metadata.source);

    return {
      type: 'agent',
      name: agentName,
      description: agentMetadata.description,
      path: agentPath,
      content,
      prompt: body.trim(),
      isLocal,
      isArchived: false,
      isPersonal,
      isTemplate: !isLocal,
      source,
      tools: agentMetadata.tools,
      model: agentMetadata.model,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Read a single output style file
 */
async function readOutputStyle(stylePath: string, isLocal = false): Promise<OutputStyle | null> {
  try {
    const content = await fs.readFile(stylePath, 'utf-8');
    const { metadata, body } = parseFrontmatter(content);
    const styleMetadata = parseOutputStyleMetadata(content);
    const styleName = path.basename(stylePath, '.md');
    const isPersonal = isPersonalPath(stylePath);
    const source = getCustomizationSource(styleName, isLocal, metadata.source);

    return {
      type: 'output-style',
      name: styleName,
      description: styleMetadata.description,
      path: stylePath,
      content,
      instructions: body.trim(),
      isLocal,
      isArchived: false,
      isPersonal,
      isTemplate: !isLocal,
      source,
    };
  } catch (error) {
    return null;
  }
}

/**
 * List all skills from the repository
 */
export async function listRepoSkills(): Promise<Skill[]> {
  try {
    const entries = await fs.readdir(SKILLS_REPO_PATH, { withFileTypes: true });
    const skillPromises = entries
      .filter(entry => entry.isDirectory())
      .map(entry => readSkill(path.join(SKILLS_REPO_PATH, entry.name), false));

    const skills = await Promise.all(skillPromises);
    return skills.filter((skill): skill is Skill => skill !== null);
  } catch (error) {
    console.error('Failed to list repo skills:', error);
    return [];
  }
}

/**
 * List all commands from the repository
 */
export async function listRepoCommands(): Promise<Command[]> {
  try {
    const entries = await fs.readdir(COMMANDS_REPO_PATH, { withFileTypes: true });
    const commandPromises = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => readCommand(path.join(COMMANDS_REPO_PATH, entry.name), false));

    const commands = await Promise.all(commandPromises);
    return commands.filter((command): command is Command => command !== null);
  } catch (error) {
    console.error('Failed to list repo commands:', error);
    return [];
  }
}

/**
 * List all agents from the repository
 */
export async function listRepoAgents(): Promise<Agent[]> {
  try {
    const entries = await fs.readdir(AGENTS_REPO_PATH, { withFileTypes: true });
    const agentPromises = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => readAgent(path.join(AGENTS_REPO_PATH, entry.name), false));

    const agents = await Promise.all(agentPromises);
    return agents.filter((agent): agent is Agent => agent !== null);
  } catch (error) {
    console.error('Failed to list repo agents:', error);
    return [];
  }
}

/**
 * List all output styles from the repository
 */
export async function listRepoOutputStyles(): Promise<OutputStyle[]> {
  try {
    const entries = await fs.readdir(OUTPUT_STYLES_REPO_PATH, { withFileTypes: true });
    const stylePromises = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => readOutputStyle(path.join(OUTPUT_STYLES_REPO_PATH, entry.name), false));

    const styles = await Promise.all(stylePromises);
    return styles.filter((style): style is OutputStyle => style !== null);
  } catch (error) {
    console.error('Failed to list repo output styles:', error);
    return [];
  }
}

/**
 * List all local skills (only available server-side)
 * @param customBasePath - Optional custom .claude base path
 */
export async function listLocalSkills(customBasePath?: string): Promise<Skill[]> {
  const localPath = getLocalSkillsPath(customBasePath);

  try {
    const entries = await fs.readdir(localPath, { withFileTypes: true });
    const skillPromises = entries
      // Ignore hidden (.) and archived (_) directories
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('_'))
      .map(entry => readSkill(path.join(localPath, entry.name), true));

    const skills = await Promise.all(skillPromises);
    return skills.filter((skill): skill is Skill => skill !== null);
  } catch (error: any) {
    // Only log errors that are not "directory doesn't exist"
    if (error?.code !== 'ENOENT') {
      console.error('Failed to list local skills:', error);
    }
    return [];
  }
}

/**
 * List all local commands
 * @param customBasePath - Optional custom .claude base path
 */
export async function listLocalCommands(customBasePath?: string): Promise<Command[]> {
  const localPath = getLocalCommandsPath(customBasePath);

  try {
    const entries = await fs.readdir(localPath, { withFileTypes: true });
    const commandPromises = entries
      // Ignore archived files (starting with _)
      .filter(entry => entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_'))
      .map(entry => readCommand(path.join(localPath, entry.name), true));

    const commands = await Promise.all(commandPromises);
    return commands.filter((command): command is Command => command !== null);
  } catch (error: any) {
    // Only log errors that are not "directory doesn't exist"
    if (error?.code !== 'ENOENT') {
      console.error('Failed to list local commands:', error);
    }
    return [];
  }
}

/**
 * List all local agents
 * @param customBasePath - Optional custom .claude base path
 */
export async function listLocalAgents(customBasePath?: string): Promise<Agent[]> {
  const localPath = getLocalAgentsPath(customBasePath);

  try {
    const entries = await fs.readdir(localPath, { withFileTypes: true });
    const agentPromises = entries
      // Ignore archived files (starting with _)
      .filter(entry => entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_'))
      .map(entry => readAgent(path.join(localPath, entry.name), true));

    const agents = await Promise.all(agentPromises);
    return agents.filter((agent): agent is Agent => agent !== null);
  } catch (error: any) {
    // Only log errors that are not "directory doesn't exist"
    if (error?.code !== 'ENOENT') {
      console.error('Failed to list local agents:', error);
    }
    return [];
  }
}

/**
 * List all local output styles
 * @param customBasePath - Optional custom .claude base path
 */
export async function listLocalOutputStyles(customBasePath?: string): Promise<OutputStyle[]> {
  const localPath = getLocalOutputStylesPath(customBasePath);

  try {
    const entries = await fs.readdir(localPath, { withFileTypes: true });
    const stylePromises = entries
      // Ignore archived files (starting with _)
      .filter(entry => entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_'))
      .map(entry => readOutputStyle(path.join(localPath, entry.name), true));

    const styles = await Promise.all(stylePromises);
    return styles.filter((style): style is OutputStyle => style !== null);
  } catch (error: any) {
    // Only log errors that are not "directory doesn't exist"
    if (error?.code !== 'ENOENT') {
      console.error('Failed to list local output styles:', error);
    }
    return [];
  }
}

/**
 * Get a specific skill by name
 */
export async function getSkill(name: string, isLocal = false, basePath?: string): Promise<Skill | null> {
  const skillsPath = isLocal ? getLocalSkillsPath(basePath) : SKILLS_REPO_PATH;
  const skillPath = path.join(skillsPath, name);
  return readSkill(skillPath, isLocal);
}

/**
 * Get a specific command by name
 */
export async function getCommand(name: string, isLocal = false, basePath?: string): Promise<Command | null> {
  const commandsPath = isLocal ? getLocalCommandsPath(basePath) : COMMANDS_REPO_PATH;
  const commandPath = path.join(commandsPath, `${name}.md`);
  return readCommand(commandPath, isLocal);
}

/**
 * Get a specific agent by name
 */
export async function getAgent(name: string, isLocal = false, basePath?: string): Promise<Agent | null> {
  const agentsPath = isLocal ? getLocalAgentsPath(basePath) : AGENTS_REPO_PATH;
  const agentPath = path.join(agentsPath, `${name}.md`);
  return readAgent(agentPath, isLocal);
}

/**
 * Get a specific output style by name
 */
export async function getOutputStyle(name: string, isLocal = false, basePath?: string): Promise<OutputStyle | null> {
  const stylesPath = isLocal ? getLocalOutputStylesPath(basePath) : OUTPUT_STYLES_REPO_PATH;
  const stylePath = path.join(stylesPath, `${name}.md`);
  return readOutputStyle(stylePath, isLocal);
}

/**
 * Get a specific customization by name and type.
 * This is a wrapper around the specific get functions.
 */
export async function getCustomization(
  name: string,
  type: string,
  basePath?: string
): Promise<Skill | Command | Agent | OutputStyle | null> {
  const isLocal = true; // For now, we assume we are always dealing with local files in this context

  switch (type) {
    case 'skill':
      return getSkill(name, isLocal, basePath);
    case 'command':
      return getCommand(name, isLocal, basePath);
    case 'agent':
      return getAgent(name, isLocal, basePath);
    case 'output-style':
      return getOutputStyle(name, isLocal, basePath);
    default:
      return null;
  }
}

/**
 * Read Claude Code settings.json
 */
export async function readSettings(isLocal = false): Promise<Settings | null> {
  const settingsPath = isLocal
    ? path.join(getClaudeBasePath(), 'settings.json')
    : path.join(process.cwd(), '.claude', 'settings.json');

  try {
    const content = await fs.readFile(settingsPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Write Claude Code settings.json
 */
export async function writeSettings(settings: Settings, isLocal = false): Promise<void> {
  const settingsPath = isLocal
    ? path.join(getClaudeBasePath(), 'settings.json')
    : path.join(process.cwd(), '.claude', 'settings.json');

  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
}

// ============================================================================
// Comparison and Sync Functions
// ============================================================================

/**
 * Calculate MD5 hash of content for comparison
 */
function calculateHash(content: string): string {
  return createHash('md5').update(content).digest('hex');
}

/**
 * Get library path for a customization type
 */
function getLibraryPath(type: CustomizationType): string {
  switch (type) {
    case 'skill':
      return SKILLS_REPO_PATH;
    case 'command':
      return COMMANDS_REPO_PATH;
    case 'agent':
      return AGENTS_REPO_PATH;
    case 'output-style':
      return OUTPUT_STYLES_REPO_PATH;
  }
}

/**
 * Get local path for a customization type
 */
function getLocalPath(type: CustomizationType): string {
  switch (type) {
    case 'skill':
      return getLocalSkillsPath();
    case 'command':
      return getLocalCommandsPath();
    case 'agent':
      return getLocalAgentsPath();
    case 'output-style':
      return getLocalOutputStylesPath();
  }
}

/**
 * Read library customization content
 */
async function readLibraryContent(type: CustomizationType, name: string): Promise<string | null> {
  try {
    const libraryPath = getLibraryPath(type);

    if (type === 'skill') {
      const skillPath = path.join(libraryPath, name, 'SKILL.md');
      return await fs.readFile(skillPath, 'utf-8');
    } else {
      const filePath = path.join(libraryPath, `${name}.md`);
      return await fs.readFile(filePath, 'utf-8');
    }
  } catch (error) {
    return null;
  }
}

/**
 * Read local customization content
 */
async function readLocalContent(type: CustomizationType, name: string): Promise<string | null> {
  try {
    const localPath = getLocalPath(type);

    if (type === 'skill') {
      const skillPath = path.join(localPath, name, 'SKILL.md');
      return await fs.readFile(skillPath, 'utf-8');
    } else {
      const filePath = path.join(localPath, `${name}.md`);
      return await fs.readFile(filePath, 'utf-8');
    }
  } catch (error) {
    return null;
  }
}

/**
 * Compare local customization with library version
 */
export async function compareWithLibrary(
  type: CustomizationType,
  name: string
): Promise<{
  isModified: boolean;
  localHash: string | null;
  libraryHash: string | null;
  localContent: string | null;
  libraryContent: string | null;
}> {
  const localContent = await readLocalContent(type, name);
  const libraryContent = await readLibraryContent(type, name);

  const localHash = localContent ? calculateHash(localContent) : null;
  const libraryHash = libraryContent ? calculateHash(libraryContent) : null;

  return {
    isModified: localHash !== null && libraryHash !== null && localHash !== libraryHash,
    localHash,
    libraryHash,
    localContent,
    libraryContent,
  };
}

/**
 * Sync customization from library to local
 */
export async function syncToLocal(
  type: CustomizationType,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const libraryContent = await readLibraryContent(type, name);

    if (!libraryContent) {
      return { success: false, error: 'Library customization not found' };
    }

    const localPath = getLocalPath(type);

    // Ensure local directory exists
    await fs.mkdir(localPath, { recursive: true });

    if (type === 'skill') {
      // For skills, copy entire directory
      const librarySkillPath = path.join(getLibraryPath(type), name);
      const localSkillPath = path.join(localPath, name);

      // Create local skill directory
      await fs.mkdir(localSkillPath, { recursive: true });

      // Copy all files from library skill
      const entries = await fs.readdir(librarySkillPath, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(librarySkillPath, entry.name);
        const destPath = path.join(localSkillPath, entry.name);

        if (entry.isFile()) {
          await fs.copyFile(srcPath, destPath);
        } else if (entry.isDirectory()) {
          // Recursively copy subdirectories
          await copyDirectory(srcPath, destPath);
        }
      }
    } else {
      // For commands, agents, output-styles, just copy the file
      const destPath = path.join(localPath, `${name}.md`);
      await fs.writeFile(destPath, libraryContent, 'utf-8');
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper to recursively copy directory
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    } else if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    }
  }
}

/**
 * Check if local customization has updates available from library
 */
export async function checkForUpdates(
  type: CustomizationType,
  name: string
): Promise<{ hasUpdate: boolean; libraryHash: string | null }> {
  const comparison = await compareWithLibrary(type, name);

  return {
    hasUpdate: comparison.isModified,
    libraryHash: comparison.libraryHash,
  };
}

/**
 * Delete local customization
 */
export async function deleteLocalCustomization(
  type: CustomizationType,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const localPath = getLocalPath(type);

    if (type === 'skill') {
      const skillPath = path.join(localPath, name);
      await fs.rm(skillPath, { recursive: true, force: true });
    } else {
      const filePath = path.join(localPath, `${name}.md`);
      await fs.unlink(filePath);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a local customization exists by name
 */
export async function checkLocalExists(type: CustomizationType, name: string): Promise<boolean> {
  try {
    const localPath = getLocalPath(type);

    if (type === 'skill') {
      const skillPath = path.join(localPath, name, 'SKILL.md');
      await fs.access(skillPath);
      return true;
    } else {
      const filePath = path.join(localPath, `${name}.md`);
      await fs.access(filePath);
      return true;
    }
  } catch {
    return false;
  }
}

/**
 * Check if a local customization is modified (differs from library version)
 */
export async function checkLocalModified(type: CustomizationType, name: string): Promise<boolean> {
  try {
    // Check if it exists locally
    const exists = await checkLocalExists(type, name);
    if (!exists) {
      return false;
    }

    // Compare with library version
    const comparison = await compareWithLibrary(type, name);
    return comparison.isModified;
  } catch {
    return false;
  }
}

/**
 * Enrich library skills with installation status
 */
export async function listRepoSkillsWithStatus(): Promise<Skill[]> {
  const skills = await listRepoSkills();

  // Check which ones are installed locally and if modified
  const skillsWithStatus = await Promise.all(
    skills.map(async (skill) => ({
      ...skill,
      isInstalled: await checkLocalExists('skill', skill.name),
      isModified: await checkLocalModified('skill', skill.name),
    }))
  );

  return skillsWithStatus;
}

/**
 * Enrich library commands with installation status
 */
export async function listRepoCommandsWithStatus(): Promise<Command[]> {
  const commands = await listRepoCommands();

  const commandsWithStatus = await Promise.all(
    commands.map(async (command) => ({
      ...command,
      isInstalled: await checkLocalExists('command', command.name),
      isModified: await checkLocalModified('command', command.name),
    }))
  );

  return commandsWithStatus;
}

/**
 * Enrich library agents with installation status
 */
export async function listRepoAgentsWithStatus(): Promise<Agent[]> {
  const agents = await listRepoAgents();

  const agentsWithStatus = await Promise.all(
    agents.map(async (agent) => ({
      ...agent,
      isInstalled: await checkLocalExists('agent', agent.name),
      isModified: await checkLocalModified('agent', agent.name),
    }))
  );

  return agentsWithStatus;
}

/**
 * Enrich library output styles with installation status
 */
export async function listRepoOutputStylesWithStatus(): Promise<OutputStyle[]> {
  const outputStyles = await listRepoOutputStyles();

  const outputStylesWithStatus = await Promise.all(
    outputStyles.map(async (style) => ({
      ...style,
      isInstalled: await checkLocalExists('output-style', style.name),
      isModified: await checkLocalModified('output-style', style.name),
    }))
  );

  return outputStylesWithStatus;
}
