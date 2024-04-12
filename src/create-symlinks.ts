import chalk from 'chalk';
import * as fs from 'fs';
import { mkdirpSync as mkdirp } from 'mkdirp';
import * as path from 'path';
import { sync as rimraf } from 'rimraf';
import { LogLevel } from './log';

interface PackageInfo {
  name: string;
  folderName: string;
  path: string;
  workspace: string;
  dependencies: string[];
  devDependencies: string[];
}

export function processPackages(
  packageInfos: PackageInfo[],
  rootDir: string,
  log: (str: string, level: LogLevel) => void
) {
  log(chalk.blue(`Starting to process ${packageInfos.length} packages...`), 'info');

  packageInfos.forEach(packageInfo => {
    const packageName = chalk.green(packageInfo.name);
    log(chalk.blue(`Processing package: ${packageName}`), 'info');

    const targetNodeModulesPath = path.join(packageInfo.path, 'node_modules', packageInfo.name);
    const distPath = path.join(packageInfo.path, 'dist');

    log(chalk.yellow(`Checking if target node_modules path exists: ${targetNodeModulesPath}`), 'debug');
    if (fs.existsSync(targetNodeModulesPath)) {
      log(chalk.red(`Removing existing node_modules directory: ${targetNodeModulesPath}`), 'info');
      rimraf(targetNodeModulesPath);
    }

    log(chalk.yellow(`Ensuring directory exists for symlink: ${path.dirname(targetNodeModulesPath)}`), 'info');
    mkdirp(path.dirname(targetNodeModulesPath));

    log(chalk.yellow(`Creating symlink from ${distPath} to ${targetNodeModulesPath}`), 'info');
    fs.symlinkSync(distPath, targetNodeModulesPath, 'junction');

    log(chalk.green(`Finished processing ${packageName}`), 'info');
  });

  const rootNodeModulesPath = path.join(rootDir, 'node_modules');
  log(chalk.blue(`Processing root node_modules at ${rootNodeModulesPath}`), 'debug');

  packageInfos.forEach(packageInfo => {
    const packageName = chalk.green(packageInfo.name);
    const symlinkPath = path.join(rootNodeModulesPath, packageInfo.name);

    // Check and remove the existing symlink if it exists
    if (fs.existsSync(symlinkPath)) {
      log(chalk.red(`Removing existing symlink for ${packageName} at root`), 'info');
      rimraf(symlinkPath);
    }

    const distPath = path.join(packageInfo.path, 'dist');
    log(chalk.yellow(`Creating symlink in root for ${packageName}`), 'info');
    mkdirp(path.dirname(symlinkPath));
    fs.symlinkSync(distPath, symlinkPath, 'junction');
  });

  log(chalk.blue('All packages processed successfully including root node_modules.'), 'debug');
}
