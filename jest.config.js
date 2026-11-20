module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  collectCoverageFrom: [
    "src/api/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "src/logic/**/*.{ts,tsx}",
    "src/storage/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
};
