import { join } from 'path';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { fork } from 'child_process';
import { toFileName } from '@nrwl/workspace';
import { ExecutorContext } from '@nrwl/devkit';

export interface ReactNativeBuildOptions {
  dev: boolean;
  platform: string;
  entryFile: string;
  outputPath: string;
  maxWorkers: number;
  sourceMap: boolean;
}

export interface ReactNativeBuildOutput {
  success: boolean;
}

export default async function* run(
  options: ReactNativeBuildOptions,
  context: ExecutorContext
): AsyncGenerator<ReactNativeBuildOutput> {
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
    const cliOptions = createBundleOptions(options);
    const platform = sanitizePlatform(options);

    const cp = fork(
      join(workspaceRoot, '/node_modules/expo/bin/cli.js'),
      [`build:${platform}`, ...cliOptions],
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

function createBundleOptions(options) {
  return Object.keys(options).reduce((acc, _k) => {
    const v = options[_k];
    const k = toFileName(_k);
    if (v === undefined) return acc;
    if (k !== 'platform') {
      acc.push(`--${k}`, v);
    }
    return acc;
  }, []);
}

function sanitizePlatform(options) {
  const defautlPlatform = 'ios';
  return options.platform ? options.platform : defautlPlatform;
}
