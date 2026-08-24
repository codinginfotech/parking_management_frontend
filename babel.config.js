module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: { '@': './src' },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    ],
    ['module:react-native-dotenv', { moduleName: '@env', path: '.env' }],
    // Must stay last: reanimated v4 worklets transform.
    'react-native-worklets/plugin',
  ],
};
