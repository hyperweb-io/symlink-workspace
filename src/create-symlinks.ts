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

function fileOrFolderOrLinkExists(path) {
  try {
    const stats = fs.lstatSync(path);
    if (stats.isDirectory()) {
      return 'directory';
    } else if (stats.isFile()) {
      return 'file';
    } else if (stats.isSymbolicLink()) {
      return 'symlink';
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error; // Re-throw other errors that might occur
  }
  return true;
}

export function processPackages(
  packageInfos: PackageInfo[],
  rootDir: string,
  log: (str: string, level: LogLevel) => void
) {
  log(chalk.blue(`Starting to process ${packageInfos.length} packages...`), 'info');

  packageInfos.forEach(packageInfo => {
    const packageName = chalk.green(packageInfo.name);
    log(`[${chalk.blue(packageName)}]: ${chalk.blue(`Processing package`)}`, 'info');

    // Link each dependency inside this package's node_modules
    packageInfo.dependencies.forEach(dep => {
      const depInfo = packageInfos.find(info => info.name === dep);
      if (depInfo) {
        const depDistPath = path.join(depInfo.path, 'dist');
        const symlinkTarget = path.join(packageInfo.path, 'node_modules', depInfo.name);

        log(`[${chalk.blue(packageName)}]: Linking dependency ${chalk.green(dep)}`, 'info');
        if (fileOrFolderOrLinkExists(symlinkTarget)) {
          log(`[${chalk.blue(packageName)}]: ${chalk.grey(`Removing existing node_modules directory: ${symlinkTarget}`)}`, 'info');
          rimraf(symlinkTarget);
        }
        mkdirp(path.dirname(symlinkTarget));
        fs.symlinkSync(depDistPath, symlinkTarget, 'junction');
      }
    });
    log(`[${chalk.blue(packageName)}]: ${chalk.green(`Finished processing ${packageName}`)}`, 'info');
  });

  const rootNodeModulesPath = path.join(rootDir, 'node_modules');
  log(chalk.blue(`Processing root node_modules at ${rootNodeModulesPath}`), 'debug');

  packageInfos.forEach(packageInfo => {
    const packageName = chalk.green(packageInfo.name);
    const symlinkPath = path.join(rootNodeModulesPath, packageInfo.name);

    // Check and remove the existing symlink if it exists
    if (fileOrFolderOrLinkExists(symlinkPath)) {
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
