module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|moti|react-native-reanimated|rive-react-native))",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.expo/", "/dist/", "/tools/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
    "^@locales/(.*)$": "<rootDir>/locales/$1",
  },
};
