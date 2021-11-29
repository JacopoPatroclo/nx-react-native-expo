import { join, normalize, Path } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  mergeWith,
  move,
  noop,
  pathTemplate,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  addLintFiles,
  formatFiles,
  generateProjectLint,
  Linter,
  names,
  NxJson,
  offsetFromRoot,
  toClassName,
  toFileName,
  updateJsonInTree,
} from '@nrwl/workspace';
import { updateWorkspaceInTree } from '@nrwl/workspace/src/utils/ast-utils';
import { toJS } from '@nrwl/workspace/src/utils/rules/to-js';
import init from '../init/init.impl';
import { Schema } from './schema';
import { extraEslintDependencies, reactEslintJson } from '@nrwl/react';

interface NormalizedSchema extends Schema {
  projectName: string;
  appProjectRoot: Path;
  className: string;
  lowerCaseName: string;
}

export default function (schema: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const options = normalizeOptions(host, schema);

    return chain([
      init({
        skipFormat: true,
        appProjectRoot: options.appProjectRoot,
      }),
      addLintFiles(options.appProjectRoot, Linter.EsLint, {
        localConfig: reactEslintJson,
        extraPackageDeps: extraEslintDependencies,
      }),
      createApplicationFiles(options),
      updateNxJson(options),
      addProject(options),
      addJest(options),
      formatFiles(options),
    ]);
  };
}

function createApplicationFiles(options: NormalizedSchema): Rule {
  const data = {
    ...names(options.name),
    ...options,
    offsetFromRoot: offsetFromRoot(options.appProjectRoot),
  };
  return mergeWith(
    apply(url(`./files/expo`), [
      pathTemplate(data),
      applyTemplates(data),
      move(options.appProjectRoot),
      options.js ? toJS() : noop(),
    ])
  );
}

function updateNxJson(options: NormalizedSchema): Rule {
  return updateJsonInTree<NxJson>('workspace.json', (json) => {
    const parsedTags = options.tags
      ? options.tags.split(',').map((s) => s.trim())
      : [];
    json.projects[options.projectName] = { tags: parsedTags };
    return json;
  });
}

function addProject(options: NormalizedSchema): Rule {
  return updateWorkspaceInTree((json) => {
    const architect: { [key: string]: any } = {};

    architect.bundle = {
      builder: 'nx-react-native-expo:bundle',
      options: {},
    };

    architect.start = {
      builder: 'nx-react-native-expo:start',
      options: {},
    };

    architect['run-ios'] = {
      builder: 'nx-react-native-expo:run-ios',
      options: {},
    };

    architect['run-android'] = {
      builder: 'nx-react-native-expo:run-android',
      options: {},
    };

    architect['run-web'] = {
      builder: 'nx-react-native-expo:run-web',
      options: {},
    };

    architect['publish'] = {
      builder: 'nx-react-native-expo:publish',
      options: {},
    };

    architect.lint = generateProjectLint(
      normalize(options.appProjectRoot),
      join(normalize(options.appProjectRoot), 'tsconfig.json'),
      Linter.EsLint,
      [`${options.appProjectRoot}/**/*.{js,ts,tsx}`]
    );

    json.projects[options.projectName] = {
      root: options.appProjectRoot,
      sourceRoot: join(options.appProjectRoot, 'src'),
      projectType: 'application',
      schematics: {},
      architect,
    };

    json.defaultProject = json.defaultProject || options.projectName;

    return json;
  });
}

function addJest(options: NormalizedSchema): Rule {
  return options.unitTestRunner === 'jest'
    ? externalSchematic('@nrwl/jest', 'jest-project', {
        project: options.projectName,
        supportTsx: true,
        skipSerializers: true,
        setupFile: 'none',
      })
    : noop();
}

function normalizeOptions(host: Tree, options: Schema): NormalizedSchema {
  const appDirectory = options.directory
    ? `${toFileName(options.directory)}/${toFileName(options.name)}`
    : toFileName(options.name);

  const appProjectName = appDirectory.replace(new RegExp('/', 'g'), '-');

  const appProjectRoot = normalize(`apps/${appDirectory}`);

  const className = toClassName(options.name);

  return {
    ...options,
    className,
    lowerCaseName: className.toLowerCase(),
    name: toFileName(options.name),
    projectName: appProjectName,
    appProjectRoot,
  };
}
