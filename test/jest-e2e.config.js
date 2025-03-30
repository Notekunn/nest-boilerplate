/* eslint-disable @typescript-eslint/no-require-imports */
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('../tsconfig.json')

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '../coverage',
  rootDir: '.',
  testRegex: '.e2e-spec.ts$',
  collectCoverageFrom: ['**/*.(t|j)s'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/..' }),
  setupFiles: ['dotenv/config'],
}
