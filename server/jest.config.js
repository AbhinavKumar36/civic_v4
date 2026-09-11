/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!@xenova/transformers)'
  ],
  moduleNameMapper: {
    '^@xenova/transformers$': '<rootDir>/src/__tests__/__mocks__/@xenova/transformers.ts'
  }
};
