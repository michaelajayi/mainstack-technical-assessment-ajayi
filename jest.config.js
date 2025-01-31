module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testTimeout: 60000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 1,
};