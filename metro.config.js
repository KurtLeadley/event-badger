// metro.config.js

const { getDefaultConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  resolver: {
    assetExts: [
      ...defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
      'png',
      'jpg',
      'jpeg',
      'gif',
      'webp',
      'svg',
    ],
    sourceExts: [
      ...defaultConfig.resolver.sourceExts,
      'js',
      'jsx',
      'ts',
      'tsx',
      'json',
      'svg',
    ],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    assetRegistryPath: path.resolve(
      __dirname,
      'node_modules/react-native/Libraries/Image/AssetRegistry'
    ),
  },
};



