import { chain, Rule } from '@angular-devkit/schematics';
import {
  addDepsToPackageJson,
  updateJsonInTree,
  addPackageWithInit,
  updateWorkspace,
} from '@nrwl/workspace';
import { Schema } from './schema';
import {
  nxVersion,
  reactVersion,
  reactNativeVersion,
  typesReactVersion,
  typesReactNativeVersion,
  expoVersion,
  expoStatusBarVersion,
  reactDomVersion,
  reactNativeWebVersion,
  typesReactDomVersion,
  expoCliVersion,
  reactTestRendererVersion,
  typesReactTestRendererVersion,
} from '../../utils/versions';
import { JsonObject } from '@angular-devkit/core';
import ignore from 'ignore';

export default function (schema: Schema) {
  return chain([
    setWorkspaceDefaults(),
    addPackageWithInit('@nrwl/jest'),
    addDependencies(),
    updateGitIgnore(schema.appProjectRoot),
    moveDependency(),
  ]);
}

export function addDependencies(): Rule {
  return addDepsToPackageJson(
    {
      expo: expoVersion,
      'expo-status-bar': expoStatusBarVersion,
      'react-dom': reactDomVersion,
      react: reactVersion,
      'react-native': reactNativeVersion,
      'react-native-web': reactNativeWebVersion,
    },
    {
      '@nrwl/react': nxVersion,
      '@types/react': typesReactVersion,
      '@types/react-native': typesReactNativeVersion,
      '@types/react-dom': typesReactDomVersion,
      '@types/react-test-renderer': typesReactTestRendererVersion,
      'react-test-renderer': reactTestRendererVersion,
      'expo-cli': expoCliVersion,
    }
  );
}

function moveDependency(): Rule {
  return updateJsonInTree('package.json', (json) => {
    json.dependencies = json.dependencies || {};

    delete json.dependencies['@nrwl/react'];
    return json;
  });
}

function setWorkspaceDefaults(): Rule {
  return updateWorkspace((workspace) => {
    workspace.extensions.cli = workspace.extensions.cli || {};
    const defaultCollection: string =
      workspace.extensions.cli &&
      ((workspace.extensions.cli as JsonObject).defaultCollection as string);

    if (!defaultCollection) {
      (workspace.extensions.cli as JsonObject).defaultCollection =
        'nx-react-native-expo';
    }
  });
}

function updateGitIgnore(appProjectRoot: string): Rule {
  return (host) => {
    if (!host.exists('.gitignore')) {
      return;
    }

    const ig = ignore();
    ig.add(host.read('.gitignore').toString());

    let updateContent = `${appProjectRoot}/node_modules\n`;

    if (!ig.ignores(`.expo-assets/example.json`)) {
      updateContent = `.expo*\nnpm-debug.*\n*.jks\n*.p8\n*.p12\n*.key\n*.mobileprovision\n*.orig.*\nweb-build/\n${updateContent}`;
    }

    const content = `${host
      .read('.gitignore')!
      .toString('utf-8')
      .trimRight()}\n${updateContent}`;
    host.overwrite('.gitignore', content);
  };
}
