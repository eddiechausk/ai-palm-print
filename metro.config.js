const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // 屏蔽 bson/mongodb 等不兼容 React Native 的包
    // 这些包使用了 Static class blocks 等 Node.js 特有语法
    blockList: [
      new RegExp('node_modules/bson/.*'),
      new RegExp('node_modules/mongodb/.*'),
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);
