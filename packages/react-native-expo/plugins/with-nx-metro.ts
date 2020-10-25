import { appRootPath } from '@nrwl/workspace/src/utils/app-root';
import { join } from 'path';
import { resolveRequest } from './metro-resolver';
import { workspaceLayout } from '@nrwl/workspace/src/core/file-utils';
import { assetExts } from 'metro-config/src/defaults/defaults';

export function withNxMetro(config: any) {
  const watchFolders = config.watchFolders || [];
  const resolver = config.resolver || {};
  const transformer = config.transformer || {};

  config.watchFolders = watchFolders.concat([
    join(appRootPath, 'node_modules'),
    join(appRootPath, workspaceLayout().libsDir),
  ]);

  config.resolver = {
    ...resolver,
    assetExts: [...assetExts, 'db'],
    resolveRequest,
  };

  config.transformer = {
    ...transformer,
    enableBabelRCLookup: false,
  };

  return config;
}
