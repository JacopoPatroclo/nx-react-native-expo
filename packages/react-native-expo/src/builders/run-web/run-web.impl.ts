import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { join } from 'path';
import { getProjectRoot } from '../../utils/get-project-root';
import { fork } from 'child_process';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';

export interface ReactNativeRunIOsOptions extends JsonObject {
  configuration: string;
  port: number;
  scheme: string;
  simulator: string;
  device: string;
}

export interface ReactNativeRunIOsOutput {
  success: boolean;
}

export default createBuilder<ReactNativeRunIOsOptions>(run);

function run(
  options: ReactNativeRunIOsOptions,
  context: BuilderContext
): Observable<ReactNativeRunIOsOutput> {
  return from(getProjectRoot(context)).pipe(
    tap((root) => ensureNodeModulesSymlink(context.workspaceRoot, root)),
    switchMap((root) =>
      from(runCliRunWeb(context.workspaceRoot, root, options))
    ),
    map(() => {
      return {
        success: true,
      };
    })
  );
}

function runCliRunWeb(workspaceRoot, projectRoot, options) {
  return new Promise((resolve, reject) => {
    const cp = fork(
      join(workspaceRoot, '/node_modules/expo/bin/cli.js'),
      ['start', '--web', ...createRunWebOptions(options)],
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

function createRunWebOptions(options) {
  return Object.keys(options).reduce((acc, k) => {
    if (options[k]) acc.push(`--${k}`, options[k]);
    return acc;
  }, []);
}
