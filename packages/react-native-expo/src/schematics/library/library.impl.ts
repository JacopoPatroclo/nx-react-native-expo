import { convertNxGenerator, GeneratorCallback, Tree } from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/workspace';

async function reactNativeExpoInitGenerator(
  host: Tree,
  schema: any
): Promise<GeneratorCallback> {
  await libraryGenerator(host, {
    ...schema,
    component: false,
    style: 'none',
  });
  return;
}

export default reactNativeExpoInitGenerator;
export const reactNativeLibrarySchematic = convertNxGenerator(
  reactNativeExpoInitGenerator
);
