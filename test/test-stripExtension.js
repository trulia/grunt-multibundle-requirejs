var buster = require('buster');
var assert = buster.referee.assert;

// test subject
var task = require('../tasks/multibundle-requirejs.js');

buster.testCase('stripExtension',
{
  'strips extension from a filename': function()
  {
    var filename = 'script.js'
      , stripped = 'script'
      ;
    assert.equals(task._stripExtension(filename), stripped);
  },

  'strips extension from a filename and preserves path': function()
  {
    var filename = 'assets/js/main.js'
      , stripped = 'assets/js/main'
      ;
    assert.equals(task._stripExtension(filename), stripped);
  },

  'does not break extension-less paths': function()
  {
    var filename = 'static/public/js/main';

    assert.equals(task._stripExtension(filename), filename);
  }
});
