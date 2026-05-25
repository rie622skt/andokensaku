const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".expo/**",
      "tools/**",
      "android/**",
      "ios/**",
    ],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
