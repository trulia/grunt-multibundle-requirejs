var buster = require('buster');
var assert = buster.referee.assert;
var refute = buster.referee.refute;

// test subject
var task = require('../tasks/multibundle-requirejs.js');

buster.testCase('multibundleRequirejs',
{
  setUp: function()
  {
    this.grunt =
    {
      log:
      {
        writeln: this.stub(),
        error  : this.stub()
      }
    };

    this.options =
    {
      '_config':
      {
        sharedBundle: 'shared_bundle',
        handleMapping: 'handle mapping function' + Math.random()
      },

      'shared_bundle' : {},
      'bundle_first'  : {},
      'bundle_second' : {}
    };

    this.expectedComponents = ['shared_bundle', 'bundle_first', 'bundle_second'];

    this.taskContext =
    {
      async  : this.stub(),
      options: this.stub()
    };

    this.asyncCallback = this.stub();

    // context.async() returns callback function
    this.taskContext.async.returns(this.asyncCallback);

    // context.options() returns options object
    this.taskContext.options.returns(this.options);

    // internal methods
    this.stub(task, '_processComponents');
    this.stub(task, '_writeMapping');

    // execute within faked context
    task._multibundleRequirejs.call(this.taskContext, this.grunt);
  },

  'passes list of components to _processComponents': function()
  {
    assert.calledOnceWith(task._processComponents, this.grunt, this.expectedComponents, this.options);
  },

  'reports end of bundling job if logging level allows': function()
  {
    this.options['_config'].logLevel = 1;
    task._processComponents.getCall(0).args[3]();
    assert.calledOnceWith(this.grunt.log.writeln, '\n--\nAll requirejs bundles have been processed.');
  },

  'does not report end of bundling job if logging level not allow it': function()
  {
    this.options['_config'].logLevel = 4;
    task._processComponents.getCall(0).args[3]();
    refute.calledOnceWith(this.grunt.log.writeln);
  },

  'on successful callback':
  {
    setUp: function()
    {
      task._processComponents.getCall(0).args[3]();
    },

    'invokes _writeMapping without extra arguments to mark end of bundling': function()
    {
      assert.calledOnceWith(task._writeMapping, this.options['_config'].handleMapping);
    },

    'invokes grunt async callback with true flag': function()
    {
      assert.calledOnceWith(this.asyncCallback, true);
    }
  },

  'on unsuccessful callback':
  {
    setUp: function()
    {
      this.error = 'test error' + Math.random();
      task._processComponents.getCall(0).args[3](this.error);
    },

    'invokes _writeMapping without extra arguments to mark end of bundling': function()
    {
      assert.calledOnceWith(task._writeMapping, this.options['_config'].handleMapping);
    },

    'reports error to the grunt logger': function()
    {
      assert.calledOnceWith(this.grunt.log.error, this.error);
    },

    'invokes grunt async callback with false flag': function()
    {
      assert.calledOnceWith(this.asyncCallback, false);
    }
  }
});
