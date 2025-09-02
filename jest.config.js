module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    '*.js',
    '!node_modules/**',
    '!jest.config.js'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true
};
