var buster = require('buster');
var assert = buster.referee.assert;

// test subject
var task = require('../tasks/multibundle-requirejs.js');

buster.testCase('task',
{
  setUp: function()
  {
    this.grunt = {registerTask: this.stub()};
    task(this.grunt);
    // TODO: Add proper stubbing for `partial` module
  },

  'registers task with provided grunt instance': function()
  {
    assert.calledOnceWith(this.grunt.registerTask, 'multibundle_requirejs');
    assert.isFunction(this.grunt.registerTask.getCall(0).args[2]);
  }
});
