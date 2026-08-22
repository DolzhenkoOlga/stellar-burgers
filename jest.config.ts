/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',

  moduleNameMapper: {
    '^@components(.*)$': '<rootDir>/src/components$1',
    '^@pages(.*)$': '<rootDir>/src/pages$1',
    '^@slices(.*)$': '<rootDir>/src/services/slices$1',
    '^@store$': '<rootDir>/src/services/store',
    '^@utils-types$': '<rootDir>/src/utils/types',
    '^@utils(.*)$': '<rootDir>/src/utils$1'
  },

  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json'
      }
    ]
  },

  testPathIgnorePatterns: ['/node_modules/', '/tests/']
};
