
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

interface LernaConfig {
  packages: string[];
}

interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface PackageInfo {
  name: string;
  folderName: string;
  path: string;
  json: any;
  workspace: string;
  dependencies: string[];
  devDependencies: string[];
}

export const readLernaProject = (
  rootDir: string
) => {

  // Step 1: Read the lerna.json file for all workspaces
  const lernaConfigPath = path.join(rootDir, 'lerna.json');
  const lernaConfig: LernaConfig = JSON.parse(fs.readFileSync(lernaConfigPath, 'utf8'));
  const workspacePatterns = lernaConfig.packages;

  // Step 2: Read the modules and their package.json files using glob
  const packages: PackageInfo[] = [];

  workspacePatterns.forEach(pattern => {
    glob.sync(path.join(rootDir, pattern, 'package.json')).forEach((packageJsonPath: string) => {
      const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const packageName = packageJson.name;
      const folderName = path.basename(path.dirname(packageJsonPath));
      const fullPath = path.dirname(packageJsonPath);
      const workspaceName = path.basename(path.dirname(fullPath));

      // Push the package info to the packages array
      packages.push({
        name: packageName,
        json: packageJson,
        folderName: folderName,
        path: fullPath,
        workspace: workspaceName,
        dependencies: [],
        devDependencies: []
      });
    });
  });

  // Step 3 and 4: Create the array and process dependencies
  packages.forEach(packageInfo => {
    const packageJsonPath: string = path.join(packageInfo.path, 'package.json');
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check each dependency to see if it's a local package
    const localDependencies: string[] = [];
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    Object.keys(dependencies).forEach(depName => {
      if (packages.some(p => p.name === depName)) {
        localDependencies.push(depName);
      }
    });

    Object.keys(devDependencies).forEach(depName => {
      if (packages.some(p => p.name === depName)) {
        localDependencies.push(depName);
      }
    });

    packageInfo.dependencies = localDependencies;
  });

  return packages;
};