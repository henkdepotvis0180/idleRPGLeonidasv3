const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.maxWorkers = 2;
const resolveRequest = config.resolver.resolveRequest;
// Three's current CommonJS entry is a Node shim which calls process.emitWarning.
// Hermes has no Node warning API. Resolve its browser ESM renderer on native too.
const threeESM = path.join(path.dirname(require.resolve('three')), 'three.module.js');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') return { type: 'sourceFile', filePath: threeESM };
  return resolveRequest
    ? resolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};
module.exports = config;
