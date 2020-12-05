import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { join } from 'path';
import { getProjectRoot } from '../../utils/get-project-root';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { fork } from 'child_process';

export interface ReactNativePublishOptions extends JsonObject {
  plreleaseChannel: string;
  maxWorkers: number;
}

export interface ReactNativePublishOutput {
  success: boolean;
}

export default createBuilder<ReactNativePublishOptions>(run);

function run(
  options: ReactNativePublishOptions,
  context: BuilderContext
): Observable<ReactNativePublishOutput> {
  return from(getProjectRoot(context)).pipe(
    tap((root) => ensureNodeModulesSymlink(context.workspaceRoot, root)),
    switchMap((root) => runCliBuild(context.workspaceRoot, root, options)),
    map(() => {
      return {
        success: true,
      };
    })
  );
}

function runCliBuild(workspaceRoot, projectRoot, options) {
  return new Promise((resolve, reject) => {
    const cliOptions = createPublishOptions(options);
    const cp = fork(
      join(workspaceRoot, '/node_modules/expo/bin/cli.js'),
      [`publish`, ...cliOptions],
      { cwd: projectRoot }
    );
    cp.on('error', (err) => {
      reject(err);
    });
    cp.on('exit', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
}

function createPublishOptions(options) {
  return Object.keys(options).reduce((acc, k) => {
    if (options[k]) acc.push(`--${k}`, options[k]);
    return acc;
  }, []);
}
