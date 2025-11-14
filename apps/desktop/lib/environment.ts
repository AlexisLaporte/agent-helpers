import { homedir } from 'os';
import { access } from 'fs/promises';
import path from 'path';

/**
 * Always has filesystem access
 */
export function hasFilesystemAccess(): boolean {
  return true;
}

/**
 * Check if app has filesystem access to local Claude directory
 */
export async function hasLocalAccess(): Promise<boolean> {
  try {
    const claudePath = path.join(homedir(), '.claude');
    await access(claudePath);
    return true;
  } catch {
    return false;
  }
}
