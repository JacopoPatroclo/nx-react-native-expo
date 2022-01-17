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
  testingLibraryJestNativeVersion,
  testingLibraryReactNativeVersion,
  reactTestRendererVersion,
  reactTestRendererTypesVersion,
  tsconfigPathWebpackPluginVersion,
  expoWebpackConfigVersion,
} from '../../utils/versions';
import { setDefaultCollection } from '@nrwl/workspace/src/utilities/set-default-collection';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import {
  formatFiles,
  removeDependenciesFromPackageJson,
  Tree,
  addDependenciesToPackageJson,
} from '@nrwl/devkit';
import { jestInitGenerator } from '@nrwl/jest';
import { Schema } from './schema';
import { addGitIgnoreEntry } from './lib/add-gitignore-entry';

async function reactNativeExpoInitGenerator(host: Tree, schema: Schema) {
  setDefaultCollection(host, 'nx-react-native-expo');
  addGitIgnoreEntry(host);

  const tasks = [moveDependency(host), updateDependencies(host)];

  if (!schema.unitTestRunner || schema.unitTestRunner === 'jest') {
    const jestTask = jestInitGenerator(host, {});
    tasks.push(jestTask);
  }

  if (!schema.skipFormat) {
    await formatFiles(host);
  }

  return runTasksInSerial(...tasks);
}

export function updateDependencies(host: Tree) {
  return addDependenciesToPackageJson(
    host,
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
      'expo-cli': expoCliVersion,
      '@testing-library/react-native': testingLibraryReactNativeVersion,
      '@testing-library/jest-native': testingLibraryJestNativeVersion,
      'react-test-renderer': reactTestRendererVersion,
      '@types/react-test-renderer': reactTestRendererTypesVersion,
      'tsconfig-paths-webpack-plugin': tsconfigPathWebpackPluginVersion,
      '@expo/webpack-config': expoWebpackConfigVersion,
    }
  );
}

function moveDependency(host: Tree) {
  return removeDependenciesFromPackageJson(host, ['@nrwl/react'], []);
}

export default reactNativeExpoInitGenerator;
