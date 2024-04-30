import chalk from 'chalk';
import * as fs from 'fs';
import { mkdirpSync as mkdirp } from 'mkdirp';
import * as path from 'path';
import { sync as rimraf } from 'rimraf';
import { LogLevel } from './log';
import { execSync } from 'child_process';

interface PackageInfo {
  name: string;
  folderName: string;
  path: string;
  json: any;
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

function linkBinCommands(
  packageInfo: PackageInfo,
  packagePath: string,
  packageName: string,
  log: (str: string, level: LogLevel) => void
) {

  // START .bin
  if (packageInfo.json.bin) {
    Object.keys(packageInfo.json.bin).forEach(binCommand => {
      const targetBinPath = path.join(packageInfo.path, 'dist', packageInfo.json.bin[binCommand]);
      const symlinkBinPath = path.join(packagePath, 'node_modules', '.bin', binCommand);

      // if exists, chmod +x it!
      if (fileOrFolderOrLinkExists(targetBinPath)) {
        fs.chmodSync(targetBinPath, 0o755);
      }


      if (fileOrFolderOrLinkExists(symlinkBinPath)) {
        rimraf(symlinkBinPath);  // Remove existing symlink if it exists
      }
      mkdirp(path.dirname(symlinkBinPath));
      fs.symlinkSync(targetBinPath, symlinkBinPath, 'file');  // Create a symbolic link
      log(`[${chalk.magenta(packageName)}]: command ${chalk.green(binCommand)} link ${chalk.blue(symlinkBinPath)}`, 'info');
      log(`[${chalk.magenta(packageName)}]: command ${chalk.green(binCommand)} target ${chalk.green(targetBinPath)}`, 'info');
    });
  }

}

function linkModule(
  packageInfo: PackageInfo,
  depInfo: PackageInfo,
  log: (str: string, level: LogLevel) => void
) {

  const depDistPath = path.join(depInfo.path, 'dist');
  const symlinkTarget = path.join(packageInfo.path, 'node_modules', depInfo.name);
  log(`[${chalk.blue(packageInfo.name)}]: Linking dependency ${chalk.green(depInfo.name)}`, 'info');
  if (fileOrFolderOrLinkExists(symlinkTarget)) {
    rimraf(symlinkTarget);
  }
  mkdirp(path.dirname(symlinkTarget));
  fs.symlinkSync(depDistPath, symlinkTarget, 'junction');


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
        linkBinCommands(depInfo, packageInfo.path, packageInfo.name, log);
        linkModule(packageInfo, depInfo, log);
      }
    });
    log(`[${chalk.blue(packageName)}]: ${chalk.green(`Finished processing ${packageName}`)}`, 'info');
  });

  const rootNodeModulesPath = path.join(rootDir, 'node_modules');
  log(chalk.blue(`Processing root node_modules at ${rootNodeModulesPath}`), 'debug');

  packageInfos.forEach(packageInfo => {

    // START .bin
    linkBinCommands(packageInfo, rootDir, '<root>', log);
    // END .bin

    // START MODULE
    const packageName = chalk.green(packageInfo.name);
    const symlinkPath = path.join(rootNodeModulesPath, packageInfo.name);

    // Check and remove the existing symlink if it exists
    if (fileOrFolderOrLinkExists(symlinkPath)) {
      rimraf(symlinkPath);
    }

    const distPath = path.join(packageInfo.path, 'dist');
    log(chalk.yellow(`Creating symlink in root for ${packageName}`), 'info');
    mkdirp(path.dirname(symlinkPath));
    fs.symlinkSync(distPath, symlinkPath, 'junction');
    // END MODULE
  });

  log(chalk.blue('All packages processed successfully including root node_modules.'), 'debug');
}
