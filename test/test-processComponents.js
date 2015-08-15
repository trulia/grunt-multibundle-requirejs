var buster = require('buster');
var assert = buster.referee.assert;

var path      = require('path');
var requirejs = require('requirejs');
var without   = require('lodash.without');

// test subject
var task = require('../tasks/multibundle-requirejs.js');

buster.testCase('processComponents',
{
  setUp: function()
  {
    this.stub(requirejs, 'optimize');
    this.grunt =
    {
      verbose: {writeflags: this.stub()},
      log    : {writeln: this.stub()}
    };

    this.callback = this.stub();

    this._configMinimal =
    {
      sharedBundle: 'shared_bundle',
      baseUrl     : 'test/base/url' + Math.random()
    };

    this._configCustom =
    {
      sharedBundle: 'shared_bundle',
      baseUrl     : 'test/base/url' + Math.random(),

      preserveLicenseComments: 'preserveLicenseComments' + Math.random(),
      optimize               : 'optimize_flag' + Math.random(),
      destination            : 'test/destination/path' + Math.random(),
      paths                  :
      {
        'predefined'         : 'paths' + Math.random()
      },
      logLevel               : 1
    };

    this.options =
    {
      '_config'      : this._configMinimal,
      'shared_bundle': [],
      'bundle_one'   : [],
      'bundle_two'   : []
    };

    // generate list of components, sharedBundle goes first
    this.components = ['shared_bundle'].concat(without(Object.keys(this.options), '_config', this._configMinimal.sharedBundle));

    this.expectedComponentOptions =
    {
      cjsTranslate: true,
      create: true,
      removeCombined: true,
      keepBuildDir: false,
      baseUrl: this._configMinimal.baseUrl,
      optimize: 'none'
    };

    this.expectedComponentCustomOptions =
    {
      cjsTranslate: true,
      create: true,
      removeCombined: true,
      keepBuildDir: false,
      preserveLicenseComments: this._configCustom.preserveLicenseComments,
      baseUrl: this._configCustom.baseUrl,
      optimize: this._configCustom.optimize,
      paths: this._configCustom.paths,
      logLevel: this._configCustom.logLevel
    };

    this.expectedByComponent = function(component)
    {
      var componentOptions =
      {
        name: component,
        outFile: path.join(this._configMinimal.baseUrl, component + '.js')
      };
      return componentOptions;
    };

    this.expectedByComponentCustom = function(component)
    {
      var componentOptions =
      {
        name: component,
        outFile: path.join(this._configCustom.destination, component + '.js')
      };
      return componentOptions;
    };
  },

  'Passes ready to consume options to requirejs.optimize':
  {
    setUp: function()
    {
      task._processComponents(this.grunt, this.components, this.options, this.callback);
    },

    'outputs generated r.js options in verbose mode': function()
    {
      assert.calledOnce(this.grunt.verbose.writeflags);
      assert.match(this.grunt.verbose.writeflags.getCall(0).args[0], this.expectedComponentOptions);
      assert.match(this.grunt.verbose.writeflags.getCall(0).args[0], this.expectedByComponent('shared_bundle'));
    },

    'and it called once per component': function()
    {
      assert.calledOnce(requirejs.optimize);
    },

    'with expected generic options': function()
    {
      assert.match(requirejs.optimize.getCall(0).args[0], this.expectedComponentOptions);
    },

    'with expected per component options, first being `shared_bundle`': function()
    {
      assert.match(requirejs.optimize.getCall(0).args[0], this.expectedByComponent('shared_bundle'));
    },

    'with `out` set to function, for post bundle processing': function()
    {
      assert.isFunction(requirejs.optimize.getCall(0).args[0]['out']);
    },

    'invokes provided callback and passes error object on requirejs error': function()
    {
      var rjsError = 'requirejs error' + Math.random();

      // execute error requirejs callback
      requirejs.optimize.getCall(0).args[2](rjsError);
      assert.calledOnceWith(this.callback, rjsError);
    },

    'proceeds to the next component on the successful callback':
    {
      setUp: function()
      {
        // execute successful requirejs callback
        requirejs.optimize.getCall(0).args[1]();
      },

      'and it called once per component': function()
      {
        assert.calledTwice(requirejs.optimize);
      },

      'with expected generic options': function()
      {
        assert.match(requirejs.optimize.getCall(1).args[0], this.expectedComponentOptions);
      },

      'with expected per component options, second being `bundle_one`': function()
      {
        assert.match(requirejs.optimize.getCall(1).args[0], this.expectedByComponent('bundle_one'));
      },

      'proceeds to the last component on the successful callback':
      {
        setUp: function()
        {
          // execute successful requirejs callback
          requirejs.optimize.getCall(1).args[1]();
        },

        'and it called once per component': function()
        {
          assert.calledThrice(requirejs.optimize);
        },

        'with expected generic options': function()
        {
          assert.match(requirejs.optimize.getCall(2).args[0], this.expectedComponentOptions);
        },

        'with expected per component options, last being `bundle_two`': function()
        {
          assert.match(requirejs.optimize.getCall(2).args[0], this.expectedByComponent('bundle_two'));
        },

        'proceeds to the provided callback when no components left': function()
        {
          // execute successful requirejs callback
          requirejs.optimize.getCall(2).args[1]();
          assert.calledOnce(this.callback);
        }
      }
    }
  },

  'passes custom config options to the requirejs.optimze':
  {
    setUp: function()
    {
      this.options['_config'] = this._configCustom;
      task._processComponents(this.grunt, this.components, this.options, this.callback);
    },

    'with expected generic options': function()
    {
      assert.match(requirejs.optimize.getCall(0).args[0], this.expectedComponentCustomOptions);
    },

    'with expected per component options, first being `shared_bundle`': function()
    {
      assert.match(requirejs.optimize.getCall(0).args[0], this.expectedByComponentCustom('shared_bundle'));
    },

    'passes custom options to the next component on the successful callback':
    {
      setUp: function()
      {
        // execute successful requirejs callback
        requirejs.optimize.getCall(0).args[1]();
      },

      'and it called once per component': function()
      {
        assert.calledTwice(requirejs.optimize);
      },

      'with expected generic options': function()
      {
        assert.match(requirejs.optimize.getCall(1).args[0], this.expectedComponentCustomOptions);
      },

      'with expected per component options, second being `bundle_one`': function()
      {
        assert.match(requirejs.optimize.getCall(1).args[0], this.expectedByComponentCustom('bundle_one'));
      },

      'reports successful bundling when logLevel allows it': function()
      {
        assert.calledOnceWith(this.grunt.log.writeln, 'Finished "shared_bundle" bundle.\n');
      }
    }
  }
});
