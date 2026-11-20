const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "coverage/**",
      "dist/**",
      ".expo/**",
      "node_modules/**",
      "graphify-out/**",
    ],
  },
  {
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
]);
