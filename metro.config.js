const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Keep Metro's watcher/resolver out of Gradle/CMake output directories —
    // anywhere under an android/ folder, including inside node_modules —
    // concurrent native builds otherwise crash the file watcher on Windows.
    blockList: /[\\/]android[\\/](?:.*[\\/])?(?:build|\.cxx|\.gradle)[\\/]/,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
