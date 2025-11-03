import { homedir } from 'os';
import path from 'path';

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
