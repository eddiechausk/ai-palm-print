/**
 * React Native CLI configuration
 * Excludes react-native-camera from Android autolinking (v4.x incompatible with AGP 8.x)
 * Excludes react-native-iap (configuration issue causing MissingValueException)
 * TODO: Replace with react-native-vision-camera for proper camera support
 */
module.exports = {
  dependencies: {
    'react-native-iap': {
      platforms: { android: null },
    },
  },
};
