import { join } from 'path';
import { fork } from 'child_process';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { ExecutorContext } from '@nrwl/devkit';

export interface ReactNativeRunIOsOptions {
  configuration: string;
  port: number;
  scheme: string;
  simulator: string;
  device: string;
}

export interface ReactNativeRunIOsOutput {
  success: boolean;
}

export default async function* run(
  options: ReactNativeRunIOsOptions,
  context: ExecutorContext
): AsyncGenerator<ReactNativeRunIOsOutput> {
  const projectRoot = context.workspace.projects[context.projectName].root;
  const root = context.root;

  ensureNodeModulesSymlink(root, projectRoot);
  try {
    await runCliRunIOS(root, projectRoot, options);
    yield {
      success: true,
    };
  } finally {
    yield {
      success: false,
    };
  }
}

function runCliRunIOS(workspaceRoot, projectRoot, options) {
  return new Promise((resolve, reject) => {
    const cp = fork(
      join(workspaceRoot, '/node_modules/expo/bin/cli.js'),
      ['start', '--ios', ...createRunIOSOptions(options)],
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

function createRunIOSOptions(options) {
  return Object.keys(options).reduce((acc, k) => {
    if (options[k]) acc.push(`--${k}`, options[k]);
    return acc;
  }, []);
}
