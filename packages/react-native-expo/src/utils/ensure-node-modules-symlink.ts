import { join } from 'path';
import { existsSync, lstatSync, readFileSync, symlinkSync } from 'fs';
import { createDirectory } from '@nrwl/workspace';

export function ensureNodeModulesSymlink(
  workspaceRoot: string,
  projectRoot: string
) {
  const packageJsonAppPath = join(projectRoot, 'package.json');
  const appNodeModulesPath = join(projectRoot, 'node_modules');
  if (!existsSync(appNodeModulesPath)) {
    createDirectory(appNodeModulesPath);
  }
  for (const moduleName of getProjectSymlynkDependency(packageJsonAppPath)) {
    const modulePath = join(workspaceRoot, 'node_modules', moduleName);
    const moduleToPath = join(appNodeModulesPath, moduleName);
    if (!existsSync(moduleToPath)) {
      symlinkSync(modulePath, moduleToPath);
    }
  }
}

function getProjectSymlynkDependency(packageJsonPath: string): Array<string> {
  const packageJsonContent = JSON.parse(
    readFileSync(packageJsonPath, { encoding: 'utf8' }).toString()
  );
  return Object.keys(packageJsonContent.dependencies || {});
}
