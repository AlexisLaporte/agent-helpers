import { homedir } from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import { LibrarySource } from './types';

/**
 * Get the base path to the user's .claude directory
 * @param customPath - Optional custom .claude path to use instead of ~/.claude
 */
export function getClaudeBasePath(customPath?: string): string {
  return customPath || path.join(homedir(), '.claude');
}

/**
 * Get the path to the local skills directory
 * @param customBasePath - Optional custom .claude base path
 */
export function getLocalSkillsPath(customBasePath?: string): string {
  return path.join(getClaudeBasePath(customBasePath), 'skills');
}

/**
 * Get the path to the local commands directory
 * @param customBasePath - Optional custom .claude base path
 */
export function getLocalCommandsPath(customBasePath?: string): string {
  return path.join(getClaudeBasePath(customBasePath), 'commands');
}

/**
 * Get the path to the local agents directory
 * @param customBasePath - Optional custom .claude base path
 */
export function getLocalAgentsPath(customBasePath?: string): string {
  return path.join(getClaudeBasePath(customBasePath), 'agents');
}

/**
 * Get the path to the local output styles directory
 * @param customBasePath - Optional custom .claude base path
 */
export function getLocalOutputStylesPath(customBasePath?: string): string {
  return path.join(getClaudeBasePath(customBasePath), 'output-styles');
}

/**
 * Get the path to the local hooks directory
 * @param customBasePath - Optional custom .claude base path
 */
export function getLocalHooksPath(customBasePath?: string): string {
  return path.join(getClaudeBasePath(customBasePath), 'hooks');
}

/**
 * Configuration file structure
 */
export interface AppConfig {
  librarySources: LibrarySource[];
  lastSync?: string;
  theme?: 'light' | 'dark' | 'system';
  autoSync?: boolean;
}

const CONFIG_DIR = path.join(homedir(), '.config', 'agent-helpers');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Get default configuration
 */
export function getDefaultConfig(): AppConfig {
  return {
    librarySources: [
      {
        id: 'bundled',
        name: 'Official Templates',
        type: 'bundled',
        enabled: true,
      },
    ],
    theme: 'system',
    autoSync: false,
  };
}

/**
 * Load configuration from disk
 */
export async function loadConfig(): Promise<AppConfig> {
  try {
    const exists = await fs.access(CONFIG_FILE).then(() => true).catch(() => false);

    if (!exists) {
      return getDefaultConfig();
    }

    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(content);

    // Merge with defaults to ensure all fields exist
    return {
      ...getDefaultConfig(),
      ...config,
    };
  } catch (error) {
    console.error('Error loading config:', error);
    return getDefaultConfig();
  }
}

/**
 * Save configuration to disk
 */
export async function saveConfig(config: AppConfig): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}

/**
 * Add a library source to configuration
 */
export async function addLibrarySource(source: LibrarySource): Promise<void> {
  const config = await loadConfig();

  // Check if source with same ID already exists
  const existingIndex = config.librarySources.findIndex(s => s.id === source.id);

  if (existingIndex >= 0) {
    // Update existing
    config.librarySources[existingIndex] = source;
  } else {
    // Add new
    config.librarySources.push(source);
  }

  await saveConfig(config);
}

/**
 * Remove a library source from configuration
 */
export async function removeLibrarySource(sourceId: string): Promise<void> {
  const config = await loadConfig();
  config.librarySources = config.librarySources.filter(s => s.id !== sourceId);
  await saveConfig(config);
}

/**
 * Update a library source in configuration
 */
export async function updateLibrarySource(sourceId: string, updates: Partial<LibrarySource>): Promise<void> {
  const config = await loadConfig();
  const sourceIndex = config.librarySources.findIndex(s => s.id === sourceId);

  if (sourceIndex < 0) {
    throw new Error(`Library source not found: ${sourceId}`);
  }

  config.librarySources[sourceIndex] = {
    ...config.librarySources[sourceIndex],
    ...updates,
  };

  await saveConfig(config);
}

/**
 * Get all enabled library sources
 */
export async function getEnabledSources(): Promise<LibrarySource[]> {
  const config = await loadConfig();
  return config.librarySources.filter(s => s.enabled);
}

/**
 * Generic helper to get local path for any customization type
 */
export function getLocalPath(type: 'skill' | 'command' | 'agent' | 'output-style', customBasePath?: string): string {
  const basePath = getClaudeBasePath(customBasePath);

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

/**
 * Generic helper to get library path for any customization type
 */
export function getLibraryPath(type: 'skill' | 'command' | 'agent' | 'output-style'): string {
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
