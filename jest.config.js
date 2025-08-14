module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts', '<rootDir>/jest_setup_enhanced.js'],
  moduleFileExtensions: ['ts','tsx','js','jsx'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapper: {
      '^lucide-react$': '<rootDir>/__mocks__/lucide-react/index.js',
      '^@/(.*)$': '<rootDir>/src/$1',
    },
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['/node_modules/'],
  resolver: undefined,
};