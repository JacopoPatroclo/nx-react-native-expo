import { join } from 'path';
import { existsSync, readFileSync, symlinkSync } from 'fs';
import { createDirectory } from '@nrwl/workspace';
import { platform } from 'os';
import * as chalk from 'chalk';

export function ensureNodeModulesSymlink(
  workspaceRoot: string,
  projectRoot: string
) {
  const symlinkType = platform() === 'win32' ? 'junction' : 'dir';
  const packageJsonAppPath = join(projectRoot, 'package.json');
  const rootPackageJsonAppPath = join(workspaceRoot, 'package.json');
  const appNodeModulesPath = join(projectRoot, 'node_modules');
  const rootDependency = getPackageJsonDependency(rootPackageJsonAppPath);
  if (!existsSync(appNodeModulesPath)) {
    createDirectory(appNodeModulesPath);
  }
  for (const {
    name: moduleName,
    version: moduleVersion,
  } of getProjectSymlynkDependency(packageJsonAppPath)) {
    const modulePath = join(workspaceRoot, 'node_modules', moduleName);
    const moduleToPath = join(appNodeModulesPath, moduleName);

    // Handle scoped package
    if (isScopedPackage(moduleName)) {
      const { scope, name } = getScopedData(moduleName);
      // Check version for expo cli
      stopIfIsExpoScopedPackageWithVersionStar(
        scope,
        name,
        moduleVersion,
        rootDependency[moduleName]
      );
      const scopePath = join(appNodeModulesPath, scope);

      // If not exists create scoped directory
      if (!existsSync(scopePath)) {
        createDirectory(scopePath);
      }
    }
    // If the path not exists create symlink
    if (!existsSync(moduleToPath)) {
      symlinkSync(modulePath, moduleToPath, symlinkType);
    }
  }
}

function getPackageJsonDependency(
  packageJsonPath: string
): { [name: string]: string } {
  const packageJsonContent = JSON.parse(
    readFileSync(packageJsonPath, { encoding: 'utf8' }).toString()
  );
  return packageJsonContent.dependencies || {};
}

function getProjectSymlynkDependency(
  packageJsonPath: string
): Array<{ name: string; version: string }> {
  const dependencies = getPackageJsonDependency(packageJsonPath);
  return Object.keys(dependencies).map((depName) => ({
    name: depName,
    version: dependencies[depName],
  }));
}

function isScopedPackage(moduleName: string) {
  return moduleName.startsWith('@');
}

function getScopedData(moduleName: string) {
  const [scope, name] = moduleName.split('/');
  return { scope, name };
}

/**
 * A word here is needed
 * This function is here becase of expo cli and how it handles dependencies
 * In short, you can't use the wildcard character '*' as version number
 * this is why this cli is handling this case, moreover it's hepling keeping consistance
 * between the version inside your root package.json and the application one, for all the "@expo" libraryes
 */
function stopIfIsExpoScopedPackageWithVersionStar(
  scope: string,
  name: string,
  version: string,
  basePackageVersion: string
) {
  if (scope.startsWith('@expo')) {
    if (version === '*') {
      throw new Error(
        `Invalid version for @expo scoped package ${scope}/${name}. Change "${chalk.red(
          `${scope}/${name}`
        )}": "*" --> "${chalk.blue(
          `${scope}/${name}": "${basePackageVersion}`
        )}" Inside your application's package.json`
      );
    } else if (version !== basePackageVersion) {
      console.log(
        chalk.yellow(
          `Inside the package.json of your application the package ${scope}/${name} use version ${version} should be using ${basePackageVersion} as in your base package.json`
        )
      );
    }
  }
}
