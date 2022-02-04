import {
  addProjectConfiguration,
  ProjectConfiguration,
  readWorkspaceConfiguration,
  TargetConfiguration,
  Tree,
  updateWorkspaceConfiguration,
} from '@nrwl/devkit';
import { NormalizedSchema } from './normalize-options';

export function addProject(host: Tree, options: NormalizedSchema) {
  const project: ProjectConfiguration = {
    root: options.appProjectRoot,
    sourceRoot: `${options.appProjectRoot}/src`,
    projectType: 'application',
    targets: { ...getTargets(options) },
    tags: options.parsedTags,
  };

  addProjectConfiguration(host, options.projectName, {
    ...project,
  });

  const workspace = readWorkspaceConfiguration(host);

  if (!workspace.defaultProject) {
    workspace.defaultProject = options.projectName;

    updateWorkspaceConfiguration(host, workspace);
  }
}

function getTargets(options: NormalizedSchema) {
  const architect: { [key: string]: TargetConfiguration } = {};

  architect.start = {
    executor: 'nx-react-native-expo:start',
    options: {
      port: 8081,
    },
  };

  architect.serve = {
    executor: '@nrwl/workspace:run-commands',
    options: {
      command: `nx start ${options.name}`,
    },
  };

  architect['run-ios'] = {
    executor: 'nx-react-native-expo:run-ios',
    options: {},
  };

  architect['run-android'] = {
    executor: 'nx-react-native-expo:run-android',
    options: {},
  };

  architect['run-web'] = {
    executor: 'nx-react-native-expo:run-web',
    options: {},
  };

  architect.publish = {
    executor: 'nx-react-native-expo:run-web',
    options: {},
  };

  architect['bundle-ios'] = {
    executor: 'nx-react-native-expo:bundle',
    options: {
      platform: 'ios',
    },
  };

  architect['bundle-android'] = {
    executor: 'nx-react-native-expo:bundle',
    options: {
      platform: 'android',
    },
  };

  return architect;
}
