module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
      '\\.(css|scss|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    },
  };
  