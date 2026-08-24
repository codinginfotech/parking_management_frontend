const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Keep Metro's watcher/resolver out of Gradle's output directories —
    // concurrent native builds otherwise crash the file watcher on Windows.
    blockList: /(?:android[\\/](?:app[\\/])?build[\\/])|(?:android[\\/]\.gradle[\\/])|(?:android[\\/]app[\\/]\.cxx[\\/])/,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
