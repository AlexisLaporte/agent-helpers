import { LibrarySource, LibrarySourceType } from './types';
import { randomBytes } from 'crypto';

/**
 * Parse various library input formats into a LibrarySource object
 *
 * Supported formats:
 * - agent-helpers://library/add?url=X&token=Y&name=Z
 * - https://github.com/user/repo
 * - https://token@github.com/user/repo
 * - git@github.com:user/repo.git
 * - https://gist.github.com/user/gistid
 * - /local/path/to/library
 * - file:///local/path/to/library
 */
export function parseLibraryInput(input: string): LibrarySource {
  const trimmed = input.trim();

  // 1. Agent Helpers import URL
  if (trimmed.startsWith('agent-helpers://library/add')) {
    return parseAgentHelpersURL(trimmed);
  }

  // 2. GitHub URL with inline token
  if (trimmed.match(/https:\/\/[^@]+@github\.com/)) {
    return parseGitHubURLWithToken(trimmed);
  }

  // 3. GitHub Gist
  if (trimmed.includes('gist.github.com')) {
    return parseGistURL(trimmed);
  }

  // 4. SSH GitHub URL
  if (trimmed.startsWith('git@github.com:')) {
    return parseSSHURL(trimmed);
  }

  // 5. Regular GitHub HTTPS URL
  if (trimmed.includes('github.com')) {
    return parseGitHubURL(trimmed);
  }

  // 6. File URL
  if (trimmed.startsWith('file://')) {
    return parseFileURL(trimmed);
  }

  // 7. Local path (absolute or relative)
  if (trimmed.startsWith('/') || trimmed.startsWith('~/') || trimmed.startsWith('./')) {
    return parseLocalPath(trimmed);
  }

  throw new Error(`Unsupported library URL format: ${trimmed}`);
}

function parseAgentHelpersURL(input: string): LibrarySource {
  const url = new URL(input);
  const urlParam = url.searchParams.get('url');
  const token = url.searchParams.get('token');
  const name = url.searchParams.get('name');

  if (!urlParam) {
    throw new Error('Missing "url" parameter in agent-helpers:// URL');
  }

  // Determine type from the URL parameter
  let type: LibrarySourceType = 'git';
  if (urlParam.includes('gist.github.com')) {
    type = 'gist';
  } else if (urlParam.startsWith('/') || urlParam.startsWith('file://')) {
    type = 'local';
  }

  return {
    id: generateId(),
    name: name || extractRepoName(urlParam),
    type,
    url: type !== 'local' ? urlParam : undefined,
    path: type === 'local' ? urlParam.replace('file://', '') : undefined,
    token: token || undefined,
    enabled: true,
  };
}

function parseGitHubURLWithToken(input: string): LibrarySource {
  const match = input.match(/https:\/\/([^@]+)@github\.com\/(.+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL with token format');
  }

  const [, token, repoPath] = match;
  const cleanURL = `https://github.com/${repoPath.replace(/\.git$/, '')}`;

  return {
    id: generateId(),
    name: extractRepoName(cleanURL),
    type: 'git',
    url: cleanURL,
    token,
    enabled: true,
  };
}

function parseGistURL(input: string): LibrarySource {
  const match = input.match(/gist\.github\.com\/([^\/]+)\/([a-f0-9]+)/);
  if (!match) {
    throw new Error('Invalid GitHub Gist URL');
  }

  const [, user, gistId] = match;

  return {
    id: generateId(),
    name: `${user}'s Gist`,
    type: 'gist',
    url: `https://gist.github.com/${user}/${gistId}`,
    enabled: true,
  };
}

function parseSSHURL(input: string): LibrarySource {
  const match = input.match(/git@github\.com:(.+)\.git/);
  if (!match) {
    throw new Error('Invalid SSH URL format');
  }

  const repoPath = match[1];
  const url = `https://github.com/${repoPath}`;

  return {
    id: generateId(),
    name: extractRepoName(url),
    type: 'git',
    url,
    enabled: true,
  };
}

function parseGitHubURL(input: string): LibrarySource {
  const cleanURL = input
    .replace(/\.git$/, '')
    .replace(/\/+$/, '');

  return {
    id: generateId(),
    name: extractRepoName(cleanURL),
    type: 'git',
    url: cleanURL,
    enabled: true,
  };
}

function parseFileURL(input: string): LibrarySource {
  const path = input.replace('file://', '');

  return {
    id: generateId(),
    name: extractNameFromPath(path),
    type: 'local',
    path,
    enabled: true,
  };
}

function parseLocalPath(input: string): LibrarySource {
  // Expand ~ to home directory
  const path = input.startsWith('~/')
    ? input.replace('~', process.env.HOME || '/home')
    : input;

  return {
    id: generateId(),
    name: extractNameFromPath(path),
    type: 'local',
    path,
    enabled: true,
  };
}

/**
 * Extract repository name from GitHub URL
 */
function extractRepoName(url: string): string {
  const match = url.match(/github\.com\/[^\/]+\/([^\/\.]+)/);
  if (match) {
    return match[1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return 'Library';
}

/**
 * Extract name from local path
 */
function extractNameFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'Library';

  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate unique ID for library source
 */
function generateId(): string {
  return randomBytes(8).toString('hex');
}

/**
 * Generate agent-helpers:// import URL for sharing
 */
export function generateImportURL(source: LibrarySource): string {
  const params = new URLSearchParams();

  if (source.url) {
    params.set('url', source.url);
  } else if (source.path) {
    params.set('url', `file://${source.path}`);
  }

  if (source.token) {
    params.set('token', source.token);
  }

  if (source.name) {
    params.set('name', source.name);
  }

  return `agent-helpers://library/add?${params.toString()}`;
}
