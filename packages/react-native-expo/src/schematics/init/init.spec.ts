import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  Tree,
  updateWorkspaceConfiguration,
  readJson,
  readWorkspaceConfiguration,
} from '@nrwl/devkit';
import initGenerator from './init.impl';

describe('init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace(2);
    tree.write('.gitignore', '');
  });

  it('should add react dependencies', async () => {
    await initGenerator(tree, {
      skipFormat: false,
      appProjectRoot: 'apps',
      unitTestRunner: 'jest',
    });
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.dependencies['@nrwl/react']).toBeUndefined();
    expect(packageJson.dependencies['react']).toBeDefined();
    expect(packageJson.dependencies['react-native']).toBeDefined();
    expect(packageJson.devDependencies['@nrwl/react']).toBeDefined();
    expect(packageJson.devDependencies['@types/react']).toBeDefined();
    expect(packageJson.devDependencies['@types/react-native']).toBeDefined();
  });

  describe('defaultCollection', () => {
    it('should be set if none was set before', async () => {
      await initGenerator(tree, {
        skipFormat: false,
        appProjectRoot: 'apps',
        unitTestRunner: 'jest',
      });
      const workspaceJson = readWorkspaceConfiguration(tree);
      expect(workspaceJson.cli.defaultCollection).toEqual(
        'nx-react-native-expo'
      );
    });

    it('should not be set if something else was set before', async () => {
      updateWorkspaceConfiguration(tree, {
        version: 1,
        cli: { defaultCollection: '@nrwl/react', packageManager: 'npm' },
      });
      await initGenerator(tree, {
        skipFormat: false,
        appProjectRoot: 'apps',
        unitTestRunner: 'jest',
      });
      const workspaceJson = readWorkspaceConfiguration(tree);
      expect(workspaceJson.cli.defaultCollection).toEqual('@nrwl/react');
    });
  });
});
