module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // 支持 Static class blocks 语法（某些第三方包需要）
    '@babel/plugin-transform-class-static-block',
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: { '@': './src' },
      },
    ],
  ],
};
