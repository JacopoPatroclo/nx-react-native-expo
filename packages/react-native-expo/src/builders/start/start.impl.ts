import { fork } from 'child_process';
import { join } from 'path';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { ExecutorContext } from '@nrwl/devkit';

export interface ReactNativeDevServerOptions {
  host: string;
  port: number;
}

export interface ReactNativeDevServerBuildOutput {
  baseUrl: string;
  success: boolean;
}

export default async function* run(
  options: ReactNativeDevServerOptions,
  context: ExecutorContext
): AsyncGenerator<ReactNativeDevServerBuildOutput> {
  const projectRoot = context.workspace.projects[context.projectName].root;
  const root = context.root;

  ensureNodeModulesSymlink(root, projectRoot);
  try {
    await runCliStart(root, projectRoot, options);
    yield {
      baseUrl: `http://${options.host}:${options.port}`,
      success: true,
    };
  } finally {
    yield {
      baseUrl: '',
      success: false,
    };
  }
}

function runCliStart(workspaceRoot, projectRoot, options) {
  return new Promise((resolve, reject) => {
    const cp = fork(
      join(workspaceRoot, '/node_modules/expo/bin/cli.js'),
      ['start', ...createStartOptions(options)],
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

function createStartOptions(options) {
  return Object.keys(options).reduce((acc, k) => {
    if (options[k]) acc.push(`--${k}`, options[k]);
    return acc;
  }, []);
}
