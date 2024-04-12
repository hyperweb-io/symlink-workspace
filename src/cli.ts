#!/usr/bin/env node

import { processPackages } from './create-symlinks';
import { findLernaDir } from './find-lerna';
import { readLernaProject } from "./read-packages";
import { join, resolve } from 'path';

const argv = require('minimist')(process.argv.slice(2));

let dir = process.cwd();
if (argv._ && argv._[0]) {
  dir = resolve(join(dir, argv._[0]));
}

try {
  const lernaJsonPath: string = findLernaDir(dir);
  const rootDir = join(lernaJsonPath);
  const pkgs = readLernaProject(rootDir);
  processPackages(pkgs, rootDir);
} catch (error: any) {
  console.error(error.message);
}

