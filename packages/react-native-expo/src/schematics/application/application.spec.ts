import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  getProjects,
  readWorkspaceConfiguration,
  Tree,
  getWorkspaceLayout,
  readJson,
} from '@nrwl/devkit';
import appGenerator from './application.impl';

describe('app', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace(1);
    appTree.write('.gitignore', '');
  });

  it('should update workspace.json', async () => {
    await appGenerator(appTree, {
      name: 'myApp',
      skipFormat: false,
      unitTestRunner: 'jest',
    });
    const workspaceJson = readWorkspaceConfiguration(appTree);
    const projects = getProjects(appTree);

    expect(projects.get('my-app').root).toEqual('apps/my-app');
    expect(workspaceJson.defaultProject).toEqual('my-app');
  });

  it('should update nx.json', async () => {
    await appGenerator(appTree, {
      name: 'myApp',
      tags: 'one,two',
      skipFormat: false,
      unitTestRunner: 'jest',
    });
    const nxJson = getWorkspaceLayout(appTree);
    expect(nxJson.npmScope).toBe('proj');

    const project = getProjects(appTree).get('my-app');
    expect(project.tags).toStrictEqual(['one', 'two']);
  });

  it('should generate files', async () => {
    await appGenerator(appTree, {
      name: 'myApp',
      skipFormat: false,
      unitTestRunner: 'jest',
    });

    expect(appTree.exists('apps/my-app/App.tsx')).toBeTruthy();
    expect(appTree.exists('apps/my-app/index.js')).toBeTruthy();

    const tsconfig = readJson(appTree, 'apps/my-app/tsconfig.json');
    expect(tsconfig.extends).toEqual('../../tsconfig.base.json');
  });
});
