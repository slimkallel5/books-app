const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo: watch the whole workspace and resolve packages from the hoisted root.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Required so `@maktaba/ui-tokens/rn` (a subpath export) resolves.
config.resolver.unstable_enablePackageExports = true;
// Resolve the `react-native` export condition first. Some dependencies (e.g. zustand)
// ship an ESM build containing `import.meta.env`, which Metro emits verbatim into the
// classic web bundle and crashes it with "Cannot use 'import.meta' outside a module".
config.resolver.unstable_conditionNames = ['react-native', 'require', 'import'];

module.exports = config;
