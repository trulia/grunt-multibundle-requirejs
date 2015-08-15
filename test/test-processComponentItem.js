var buster = require('buster');
var assert = buster.referee.assert;

var glob = require('glob');
var path = require('path');

// test subject
var task = require('../tasks/multibundle-requirejs.js');

buster.testCase('processComponentItem',
{
  setUp: function()
  {
    this.componentOptions =
    {
      include      : [],
      packages     : [],
      paths        : {},
      shim         : {},
      insertRequire: []
    };
  },

  'adds item to the include list': function()
  {
    var item = 'test/module';

    task._processComponentItem(this.componentOptions, item);
    assert.contains(this.componentOptions.include, item);
  },

  'adds item without extension to the include list': function()
  {
    var item = 'test/module'
      , itemWithExt = item + '.js'
      ;

    task._processComponentItem(this.componentOptions, itemWithExt);
    assert.contains(this.componentOptions.include, item);
  },

  'finds matching files with glob.sync if item contains glob pattern': function()
  {
    var item = 'scripts/**/*.js';
    this.stub(glob, 'sync').returns([]);

    task._processComponentItem(this.componentOptions, item);
    assert.calledOnceWith(glob.sync, item);
  },

  'adds matching files if item contains glob pattern to the include list': function()
  {
    var item      = 'scripts/**/*.js'
      , filesList = ['scripts/a/a1', 'scripts/a/a2', 'scripts/b/b1']
      ;
    this.stub(glob, 'sync').returns(filesList);

    task._processComponentItem(this.componentOptions, item);
    assert.equals(this.componentOptions.include, filesList);
  },

  'strips extensions from files added to the include list if item contains glob pattern': function()
  {
    var item            = 'scripts/**/*.js'
      , filesList       = ['scripts/a/a1', 'scripts/a/a2', 'scripts/b/b1']
      , fileListWithExt = filesList.map(function(file){ return file + '.js'; })
      ;
    this.stub(glob, 'sync').returns(fileListWithExt);

    task._processComponentItem(this.componentOptions, item);
    assert.equals(this.componentOptions.include, filesList);
  },

  'adds simple object ({name: path}) into include and paths objects respectively': function()
  {
    var itemName = 'test_module' + Math.random()
      , itemPath = 'path/to/test/module/file'
      , item     = {}
      ;
    item[itemName] = itemPath + '.js';

    task._processComponentItem(this.componentOptions, item);
    assert.contains(this.componentOptions.include, itemName);
    assert.contains(this.componentOptions.paths[itemName], itemPath);
  },

  'adds simple object ({name: path}) into include and packages (for node_modules) lists respectively': function()
  {
    var itemName = 'test_module' + Math.random()
      , itemPath = 'node_modules/test_module/file'
      , item     = {}
      , expectedPackage =
        {
          name: itemName,
          location: path.dirname(itemPath),
          main: path.basename(itemPath)
        }
      ;

    item[itemName] = itemPath + '.js';

    task._processComponentItem(this.componentOptions, item);
    assert.contains(this.componentOptions.include, itemName);
    assert.equals(this.componentOptions.packages[0], expectedPackage);
  },

  'adds feature object ({name: {src: path, ...}}) into include and paths objects respectively': function()
  {
    var itemName = 'test_module' + Math.random()
      , itemPath = 'path/to/test/module/file'
      , item     = {}
      ;
    item[itemName] = {src: itemPath + '.js'};

    task._processComponentItem(this.componentOptions, item);
    assert.contains(this.componentOptions.include, itemName);
    assert.contains(this.componentOptions.paths[itemName], itemPath);
  },

  'adds feature object ({name: {src: path, ...}}) into include and packages (for node_modules) lists respectively': function()
  {
    var itemName = 'test_module' + Math.random()
      , itemPath = 'node_modules/test_module/file'
      , item     = {}
      , expectedPackage =
        {
          name: itemName,
          location: path.dirname(itemPath),
          main: path.basename(itemPath)
        }
      ;

    item[itemName] = {src: itemPath + '.js'};

    task._processComponentItem(this.componentOptions, item);
    assert.contains(this.componentOptions.include, itemName);
    assert.equals(this.componentOptions.packages[0], expectedPackage);
  },

  'adds exports property of the feature object ({name: {src: path, exports...}}) into the shim list': function()
  {
    var itemName    = 'test_module' + Math.random()
      , itemPath    = 'path/to/test/module/file'
      , shimExports = 'TestModule' + Math.random()
      , item        = {}
      ;
    item[itemName] = {src: itemPath + '.js', exports: shimExports};

    task._processComponentItem(this.componentOptions, item);
    assert.equals(this.componentOptions.shim[itemName], {exports: shimExports});
  },

  'adds deps property of the feature object ({name: {src: path, exports..., deps...}}) into the shim object': function()
  {
    var itemName    = 'test_module' + Math.random()
      , itemPath    = 'path/to/test/module/file'
      , shimExports = 'TestModule' + Math.random()
      , deps        = ['ext-module-one', 'ext-module-two']
      , item        = {}
      ;
    item[itemName] = {src: itemPath + '.js', exports: shimExports, deps: deps};

    task._processComponentItem(this.componentOptions, item);
    assert.equals(this.componentOptions.shim[itemName], {exports: shimExports, deps: deps});
  },

  'adds item name into the insertRequire list if insertRequire flag of the feature object ({name: {src: path, insertRequire...}}) is set': function()
  {
    var itemName    = 'test_module' + Math.random()
      , itemPath    = 'path/to/test/module/file'
      , item        = {}
      ;
    item[itemName] = {src: itemPath + '.js', insertRequire: true};

    task._processComponentItem(this.componentOptions, item);
    assert.contains(this.componentOptions.insertRequire, itemName);
  }
});
