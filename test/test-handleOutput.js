var buster = require('buster');
var assert = buster.referee.assert;

var crypto = require('crypto');

// test subject
var task = require('../tasks/multibundle-requirejs.js');

buster.testCase('handleOutput',
{
  setUp: function()
  {
    this.grunt =
    {
      file: {write: this.stub()},
      log : {writeln: this.stub()}
    };

    this.componentOptions =
    {
      name   : 'test_component',
      outFile: 'test/bundle/filepath.js',
      include: ['moduleA', 'moduleB', 'moduleC']
    };

    this.options =
    {
      '_config':
      {
        handleMapping: this.stub()
      }
    };

    // generate random paragraph of english letters
    this.output = Math.random().toString(9).slice(2).split('')
      .map(Number).map(Math.atan2.bind(Math, 90))
      .map(Math.pow.bind(Math, 17)).map(Math.ceil.bind(Math))
      .map(Array.prototype.reduce.bind([0], String.fromCharCode.bind(String)))
      .join(' ')
      ;

    // create md5 hash for the output
    this.outputHash = crypto.createHash('md5').update(this.output).digest('hex');
    // hashed filename should look like this
    this.hashedOutFile = this.componentOptions.outFile.replace(/\.js$/, '.' + this.outputHash + '.js');
  },

  'writes provided output into specified file': function()
  {
    task._handleOutput(this.grunt, this.options, this.componentOptions, this.output);

    assert.calledOnceWith(this.grunt.file.write, this.componentOptions.outFile, this.output);
  },

  'invokes provided mapping handle with bundle file': function()
  {
    task._handleOutput(this.grunt, this.options, this.componentOptions, this.output);

    assert.calledOnceWith(this.options['_config'].handleMapping, this.componentOptions.name, this.componentOptions.outFile, this.componentOptions.include);
  },

  'adds md5 hash to the filename, if hashFiles flag is set': function()
  {
    this.options['_config'].hashFiles = true;
    task._handleOutput(this.grunt, this.options, this.componentOptions, this.output);

    assert.calledOnceWith(this.grunt.file.write, this.hashedOutFile, this.output);
  },

  'invokes provided mapping handle with hashed bundle filename if hashFiles flag is set': function()
  {
    this.options['_config'].hashFiles = true;
    task._handleOutput(this.grunt, this.options, this.componentOptions, this.output);

    assert.calledOnceWith(this.options['_config'].handleMapping, this.componentOptions.name, this.hashedOutFile, this.componentOptions.include);
  },

  'invokes custom hash function if provided, with output and component options': function()
  {
    this.options['_config'].hashFiles = this.stub();
    task._handleOutput(this.grunt, this.options, this.componentOptions, this.output);

    assert.calledOnceWith(this.options['_config'].hashFiles, this.output, this.componentOptions);
  },

  'uses custom hash function output for bundle filename': function()
  {
    var customHash       = '--test-hash--' + Math.random()
      , customHashedFile = this.componentOptions.outFile.replace(/\.js$/, '.' + customHash + '.js')
      ;

    this.options['_config'].hashFiles = this.stub();
    this.options['_config'].hashFiles.returns(customHash);

    task._handleOutput(this.grunt, this.options, this.componentOptions, this.output);

    assert.calledOnceWith(this.grunt.file.write, customHashedFile, this.output);
    assert.calledOnceWith(this.options['_config'].handleMapping, this.componentOptions.name, customHashedFile, this.componentOptions.include);
  }
});
