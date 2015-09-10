// silence logger
global.__logger__backend = function(){}; // eslint-disable-line camelcase

module.exports =
{
  'Unit tests':
  {
    rootPath: './',
    environment: 'node',
    tests:
    [
      'test/test-*.js'
    ],
    sources:
    [
      '*.js',
      'tasks/**.js',
      'test/**.js'
    ],
    extensions:
    [
      require('buster-istanbul')
    ],
    'buster-istanbul':
    {
      outputDirectory: 'coverage',
      format: ['text', 'text-summary', 'lcov']
    }
  }
};
