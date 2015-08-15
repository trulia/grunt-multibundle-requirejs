var buster = require('buster');
var assert = buster.referee.assert;
var refute = buster.referee.refute;

// test subject
var task = require('../tasks/multibundle-requirejs.js');

buster.testCase('writeMapping',
{
  setUp: function()
  {
    this.componentOptions =
    {
      name   : 'component name ' + Math.random(),
      outFile: 'public/js/component.' + Math.random() + '.js',
      include: ['module/one/' + Math.random(), 'module/two/' + Math.random(), 'module/three/' + Math.random()]
    };

    this.handler = this.stub();

    this.streamLike = {write: this.stub(), end: this.stub()};
  },

  'writes provided component data into the handler function': function()
  {
    task._writeMapping(this.handler, this.componentOptions);
    assert.calledOnceWith(this.handler, this.componentOptions.name, this.componentOptions.outFile, this.componentOptions.include);
  },

  'invokes handler with no arguments if provided componentOptions undefined': function()
  {
    task._writeMapping(this.handler, undefined);
    assert.calledOnce(this.handler);
    assert.equals(this.handler.getCall(0).args.length, 0);
  },

  'invokes handler with no arguments if provided componentOptions object without name': function()
  {
    delete this.componentOptions['name'];

    task._writeMapping(this.handler, this.componentOptions);
    assert.calledOnce(this.handler);
    assert.equals(this.handler.getCall(0).args.length, 0);
  },

  'writes provided component data into provided writable stream': function()
  {
    task._writeMapping(this.streamLike, this.componentOptions);
    refute.called(this.streamLike.end);
    assert.calledOnceWith(this.streamLike.write,
    {
      component: this.componentOptions.name,
      filename: this.componentOptions.outFile,
      modules: this.componentOptions.include
    });
  },

  'invokes `.end` of writable stream if provided componentOptions undefined': function()
  {
    task._writeMapping(this.streamLike, undefined);
    refute.called(this.streamLike.write);
    assert.calledOnce(this.streamLike.end);
    assert.equals(this.streamLike.end.getCall(0).args.length, 0);
  },

  'invokes `.end` of writable stream if provided componentOptions  object without name': function()
  {
    delete this.componentOptions['name'];

    task._writeMapping(this.streamLike, this.componentOptions);
    refute.called(this.streamLike.write);
    assert.calledOnce(this.streamLike.end);
    assert.equals(this.streamLike.end.getCall(0).args.length, 0);
  }
});
