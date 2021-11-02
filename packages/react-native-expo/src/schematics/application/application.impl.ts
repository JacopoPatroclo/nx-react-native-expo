import { Tree } from '@nrwl/tao/src/shared/tree';
import { GeneratorCallback } from '@nrwl/tao/src/shared/workspace';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { Schema } from './schema';
import { normalizeOptions } from './libs/normalize-options';
import { createApplicationFiles } from './libs/create-application-files';
import { addProject } from './libs/add-project';
import initGenerator from '../init/init.impl';
import { convertNxGenerator } from '@nrwl/devkit';

async function reactNativeApplicationGenerator(
  host: Tree,
  context: Schema
): Promise<GeneratorCallback> {
  const options = normalizeOptions(host, context);

  const initTask = await initGenerator(host, { ...options, skipFormat: true });

  createApplicationFiles(host, options);
  addProject(host, options);

  return runTasksInSerial(initTask);
}

export default reactNativeApplicationGenerator;
export const reactNativeApplicationSchematic = convertNxGenerator(
  reactNativeApplicationGenerator
);
