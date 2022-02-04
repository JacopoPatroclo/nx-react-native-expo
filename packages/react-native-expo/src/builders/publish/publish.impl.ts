import { join } from 'path';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { fork } from 'child_process';
import { ExecutorContext } from '@nrwl/devkit';

export interface ReactNativePublishOptions {
  plreleaseChannel: string;
  maxWorkers: number;
}

export interface ReactNativePublishOutput {
  success: boolean;
}

export default async function* run(
  options: ReactNativePublishOptions,
  context: ExecutorContext
): AsyncGenerator<ReactNativePublishOutput> {
  const projectRoot = context.workspace.projects[context.projectName].root;
  const root = context.root;

  ensureNodeModulesSymlink(root, projectRoot);
  try {
    await runCliBuild(root, projectRoot, options);
    yield {
      success: true,
    };
  } finally {
    yield {
      success: false,
    };
  }
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
