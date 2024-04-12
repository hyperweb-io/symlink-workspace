import chalk from 'chalk';
import * as fs from 'fs';
import { mkdirpSync as mkdirp } from 'mkdirp';
import * as path from 'path';
import { sync as rimraf } from 'rimraf';

interface PackageInfo {
  name: string;
  folderName: string;
  path: string;
  workspace: string;
  dependencies: string[];
  devDependencies: string[];
}

export function processPackages(packageInfos: PackageInfo[], rootDir: string) {
  console.log(chalk.blue(`Starting to process ${packageInfos.length} packages...`));

  packageInfos.forEach(packageInfo => {
    const packageName = chalk.green(packageInfo.name);
    console.log(chalk.blue(`Processing package: ${packageName}`));

    const targetNodeModulesPath = path.join(packageInfo.path, 'node_modules', packageInfo.name);
    const distPath = path.join(packageInfo.path, 'dist');

    console.log(chalk.yellow(`Checking if target node_modules path exists: ${targetNodeModulesPath}`));
    if (fs.existsSync(targetNodeModulesPath)) {
      console.log(chalk.red(`Removing existing node_modules directory: ${targetNodeModulesPath}`));
      rimraf(targetNodeModulesPath);
    }

    console.log(chalk.yellow(`Ensuring directory exists for symlink: ${path.dirname(targetNodeModulesPath)}`));
    mkdirp(path.dirname(targetNodeModulesPath));

    console.log(chalk.yellow(`Creating symlink from ${distPath} to ${targetNodeModulesPath}`));
    fs.symlinkSync(distPath, targetNodeModulesPath, 'junction');

    console.log(chalk.green(`Finished processing ${packageName}`));
  });

  const rootNodeModulesPath = path.join(rootDir, 'node_modules');
  console.log(chalk.blue(`Processing root node_modules at ${rootNodeModulesPath}`));

  packageInfos.forEach(packageInfo => {
    const packageName = chalk.green(packageInfo.name);
    const symlinkPath = path.join(rootNodeModulesPath, packageInfo.name);

    // Check and remove the existing symlink if it exists
    if (fs.existsSync(symlinkPath)) {
      console.log(chalk.red(`Removing existing symlink for ${packageName} at root`));
      rimraf(symlinkPath);
    }

    const distPath = path.join(packageInfo.path, 'dist');
    console.log(chalk.yellow(`Creating symlink in root for ${packageName}`));
    mkdirp(path.dirname(symlinkPath));
    fs.symlinkSync(distPath, symlinkPath, 'junction');
  });

  console.log(chalk.blue('All packages processed successfully including root node_modules.'));
}
