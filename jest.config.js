/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '../coverage',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.(t|j)s'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@constants/(.*)$': '<rootDir>/constants/$1',
    '^@decorators/(.*)$': '<rootDir>/decorators/$1',
    '^@exceptions/(.*)$': '<rootDir>/exceptions/$1',
    '^@filters/(.*)$': '<rootDir>/filters/$1',
    '^@guards/(.*)$': '<rootDir>/guards/$1',
    '^@i18n/(.*)$': '<rootDir>/i18n/$1',
    '^@interceptors/(.*)$': '<rootDir>/interceptors/$1',
    '^@interfaces/(.*)$': '<rootDir>/interfaces/$1',
    '^@middlewares/(.*)$': '<rootDir>/middlewares/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
    '^@providers/(.*)$': '<rootDir>/providers/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@views/(.*)$': '<rootDir>/views/$1',
  },
}
