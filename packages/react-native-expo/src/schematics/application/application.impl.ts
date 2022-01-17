import { Tree, GeneratorCallback } from '@nrwl/devkit';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { Schema } from './schema';
import { normalizeOptions } from './libs/normalize-options';
import { createApplicationFiles } from './libs/create-application-files';
import { addProject } from './libs/add-project';
import initGenerator from '../init/init.impl';

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
