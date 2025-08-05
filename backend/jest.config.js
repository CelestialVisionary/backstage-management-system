module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/__tests__/**', '!**/config/**', '!**/utils/backupUtils.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 30000
};