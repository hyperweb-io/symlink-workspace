import { existsSync } from 'fs';
import { join, resolve } from 'path';

export function findLernaDir(currentDir: string): string {
  const filePath: string = join(currentDir, 'lerna.json');
  // Check if lerna.json exists in the current directory
  if (existsSync(filePath)) {
    return currentDir;
  } else {
    const parentDir: string = resolve(currentDir, '..');

    // Check if the parent directory is the same as the current directory (root reached)
    if (parentDir === currentDir) {
      throw new Error('lerna.json not found in any of the parent directories');
    }

    // Recursively check in the parent directory
    return findLernaDir(parentDir);
  }
}