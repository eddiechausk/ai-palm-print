/**
 * React Native CLI configuration
 * Excludes react-native-camera from Android autolinking (v4.x incompatible with AGP 8.x)
 * Excludes react-native-iap (configuration issue causing MissingValueException)
 * TODO: Replace with react-native-vision-camera for proper camera support
 */
module.exports = {
  dependencies: {
    // react-native-camera@4.2.1 完全不兼容 AGP 8.x + RN 0.73（flavor dimensions 错误）
    'react-native-camera': {
      platforms: { android: null },
    },
    'react-native-iap': {
      platforms: { android: null },
    },
  },
};
