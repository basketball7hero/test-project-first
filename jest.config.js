module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest/setup.js'],
  verbose: true,
  testRegex: '/*.test.tsx?$',
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg|css)$': '<rootDir>/jest/mocks/File.js',
    '^jest/(.*)': '<rootDir>/jest/$1',
    '^src/(.*)': '<rootDir>/src/$1'
  },
  // transformIgnorePatterns: ['<rootDir>/node_modules'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'jest'
  ],
  coverageDirectory: '.coverage',
};
