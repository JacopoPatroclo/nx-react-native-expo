import { generateFiles, offsetFromRoot, toJS, Tree } from '@nrwl/devkit';
import { join } from 'path';
import { NormalizedSchema } from './normalize-options';

export function createApplicationFiles(host: Tree, options: NormalizedSchema) {
  generateFiles(
    host,
    join(__dirname, '../files/expo'),
    options.appProjectRoot,
    {
      ...options,
      offsetFromRoot: offsetFromRoot(options.appProjectRoot),
    }
  );
  if (options.unitTestRunner === 'none') {
    host.delete(join(options.appProjectRoot, `/src/app/App.spec.tsx`));
  }

  if (options.js) {
    toJS(host);
  }
}
