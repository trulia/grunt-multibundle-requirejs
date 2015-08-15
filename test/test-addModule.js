var buster = require('buster');
var assert = buster.referee.assert;

var path = require('path');

// test subject
var task = require('../tasks/multibundle-requirejs.js');

buster.testCase('addModule',
{
  setUp: function()
  {
    this.moduleName = 'module name ' + Math.random();

    this.nodeModule = 'node_modules/module/module_file.js';
    this.localModule = 'app/lib/module.js';

    this.componentOptions =
    {
      packages: [],
      paths   : {}
    };
  },

  'adds node module properties into componentOptions.packages': function()
  {
    var nameWithoutExt = path.basename(this.nodeModule, path.extname(this.nodeModule));

    task._addModule(this.componentOptions, this.moduleName, this.nodeModule);
    assert.equals(Object.keys(this.componentOptions.paths).length, 0);
    assert.equals(this.componentOptions.packages.length, 1);
    assert.match(this.componentOptions.packages[0],
    {
      name: this.moduleName,
      location: path.dirname(this.nodeModule),
      main: nameWithoutExt
    });
  },

  'adds local module path into componentOptions.paths': function()
  {
    var pathWithoutExt = path.join(path.dirname(this.localModule), path.basename(this.localModule, path.extname(this.localModule)));

    task._addModule(this.componentOptions, this.moduleName, this.localModule);
    assert.equals(this.componentOptions.packages.length, 0);
    assert(this.moduleName in this.componentOptions.paths);
    assert.equals(this.componentOptions.paths[this.moduleName], pathWithoutExt);
  }
});
