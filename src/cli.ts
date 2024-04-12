#!/usr/bin/env node

import { processPackages } from './create-symlinks';
import { findLernaDir } from './find-lerna';
import { readLernaProject } from "./read-packages";
import { join, resolve } from 'path';
import { argv } from 'minimist';
import { getLogFn, logLevels } from './log';

const args = argv(process.argv.slice(2));

let dir = process.cwd();
if (args._ && args._[0]) {
  dir = resolve(join(dir, args._[0]));
}

// Logging function based on logLevel
const currentLogLevel = args.logLevel ? logLevels.indexOf(args.logLevel.toLowerCase()) : 2; // Default to 'info'
const log = getLogFn(currentLogLevel);
try {
  const lernaJsonPath: string = findLernaDir(dir);
  const rootDir = join(lernaJsonPath);
  const pkgs = readLernaProject(rootDir);
  processPackages(pkgs, rootDir, log);
  log('Packages processed successfully', 'info');
} catch (error: any) {
  log(error.message, 'error');
}
