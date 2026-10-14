const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
// Keep cloud/CI bundling predictable on machines reporting many CPU cores.
config.maxWorkers = 2;
module.exports = config;
