import { logger, Tree } from '@nrwl/devkit';
import ignore from 'ignore';

export const gitIgnoreEntriesForReactNativeExpo = `
#Expo ignore
.expo*
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
`;

export function addGitIgnoreEntry(host: Tree) {
  if (!host.exists('.gitignore')) {
    logger.warn(`Couldn't find .gitignore file to update`);
    return;
  }

  let content = host.read('.gitignore')?.toString('utf-8').trimRight();

  const ig = ignore();
  ig.add(host.read('.gitignore').toString());

  if (!ig.ignores('.expo-assets/example.json')) {
    content = `${content}\n${gitIgnoreEntriesForReactNativeExpo}/\n`;
  }

  if (!ig.ignores('apps/example/node_modules')) {
    content = `${content}\n## Nested node_modules\n\nnode_modules/\n`;
  }

  host.write('.gitignore', content);
}
