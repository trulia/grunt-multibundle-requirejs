var buster = require('buster');
var assert = buster.referee.assert;

var filter = require('lodash.filter');

// test subject
var task = require('../tasks/multibundle-requirejs.js');

buster.testCase('excludeIncludes',
{
  setUp: function()
  {
    this.sharedBundle = 'test-shared-bundle-' + Math.random();
    this.packages     = [{name: 'A' + Math.random()}, {name: 'B' + Math.random()}, {name: 'C' + Math.random()}];
    this.restPackages = [{name: 'X' + Math.random()}, {name: 'Y' + Math.random()}];
    this.include      = ['moduleA' + Math.random(), 'moduleB' + Math.random(), 'moduleC' + Math.random()];

    this.options =
    {
      '_config':
      {
        sharedBundle    : this.sharedBundle,
        includedInShared: undefined,
        modulesOfShared : undefined
      }
    };

    this.sharedComponentOptions =
    {
      name    : this.sharedBundle,
      packages: this.packages,
      include : this.include
    };

    this.restComponentOptions =
    {
      name    : 'non-shared-component',
      packages: undefined,
      exclude : undefined
    };
  },

  'adds include and packages from shared bundle to the global options': function()
  {
    task._excludeIncludes(this.sharedComponentOptions, this.options);

    assert.equals(this.options['_config'].includedInShared, this.sharedComponentOptions.include);
    assert.equals(this.options['_config'].modulesOfShared, this.sharedComponentOptions.packages);
  },

  'adds include (as exclude) and packages from global options into non shared bundles': function()
  {
    this.options['_config'].includedInShared = this.include;
    this.options['_config'].modulesOfShared  = this.packages;

    task._excludeIncludes(this.restComponentOptions, this.options);

    assert.equals(this.restComponentOptions.exclude, this.include);
    assert.equals(this.restComponentOptions.packages, this.packages);
  },

  'preserves list of packages on non-shared bundles': function()
  {
    this.options['_config'].modulesOfShared = this.packages;
    this.restComponentOptions.packages      = this.restPackages;

    task._excludeIncludes(this.restComponentOptions, this.options);

    assert.match(this.restComponentOptions.packages, this.packages);
    assert.match(this.restComponentOptions.packages, this.restPackages);
  },

  'keeps list of packages free of duplicates': function()
  {
    var sneakyModule = {name: 'SNEAKY' + Math.random()};

    this.options['_config'].modulesOfShared = this.packages.concat(sneakyModule);
    this.restComponentOptions.packages      = this.restPackages.concat(sneakyModule);

    task._excludeIncludes(this.restComponentOptions, this.options);

    assert.match(this.restComponentOptions.packages, this.packages);
    assert.match(this.restComponentOptions.packages, this.restPackages);

    // but only one instance of sneaky module
    assert.equals(filter(this.restComponentOptions.packages, sneakyModule).length, 1);
  }
});
