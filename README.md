# grunt-multibundle-requirejs

> Grunt task for handling multi-bundle requirejs setup

[![Build Status](https://img.shields.io/travis/trulia/grunt-multibundle-requirejs.svg)](https://travis-ci.org/trulia/grunt-multibundle-requirejs)
[![Coverage Status](https://img.shields.io/coveralls/trulia/grunt-multibundle-requirejs.svg)](https://coveralls.io/github/trulia/grunt-multibundle-requirejs?branch=master)
[![Join the chat at https://gitter.im/trulia/grunt-multibundle-requirejs](https://thefiletree.com/gh-badges/gitter.svg)](https://gitter.im/trulia/grunt-multibundle-requirejs)

## Getting Started
This plugin requires Grunt `^0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-multibundle-requirejs --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-multibundle-requirejs');
```

## The "multibundle_requirejs" task

### Overview
In your project's Gruntfile, add a section named `multibundle_requirejs` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  multibundle_requirejs: {
    options: {
      _config: {
        // task "global" options
      },

      bundle_one: [
        // bundle specific config go here
      ],

      bundle_two: [
        // bundle specific config go here
      ]
    }
  },
});
```

### Options

Example file with all the options could be found here [example.js](example.js).

#### options._config
Type: `Object`

"Global" config object for the task

#### options.[bundle_name]
Type: `Array`

List of modules to bundle into [bundle_name].

### _config object

#### _config.logLevel
Type: `Number`
Default value: `1`

Controls log level of the task and requirejs bundler, `4` being silent.

#### _config.destination
Type: `String`
Default value: `undefined`

Output folder for the bundles.

#### _config.sharedBundle
Type: `String`
Default value: `undefined`

Defines name of the shared bundle, all the modules included in the shared bundle,
will be excluded from other modules.

#### _config.hashFiles
Type: `Boolean|Function`
Default value: `undefined`

If enabled adds md5 hash (over bundle's content) to the bundle's filename.
Could be a function (`hashFiles(output, componentOptions)`), then it will be responsible for producing content hash.

#### _config.handleMapping
Type: `WriteStream|Function`
Default value: `undefined`

Will be called after each bundle creation with `component`, `filename`, `includedModules`,
to allow modules-bundle mapping. Will be called one extra time with no arguments
after all the bundles processed. In case of WriteStream `write` and `end` methods will be called respectively. For example of the mapping write stream, see `multibundle-requirejs-mapping-write`.

#### _config.baseUrl
Type: `String`
Default value: `undefined`

The root path to use for all module lookups. Passed to r.js. Also used as destination if `_config.destination` is omitted.

#### _config.optimize
Type: `String`
Default value: `none`

Minifier option, passed to r.js.

#### _config.paths
Type: `Object`
Default value: `undefined`

Path mappings for module names not found directly under baseUrl. Passed to r.js.

#### _config.preserveLicenseComments
Type: `Boolean`
Default value: `false`

Controls preseces of the license comments in the minified files. Passed to r.js.

### [bundle] list

#### [bundle].[filepath]
Type: `String`
Example: `'app/lib/my_module.js'`

Adds specified file to the parent bundle.

#### [bundle].[glob_mask]
Type: `String`
Example: `'app/lib/**/*.js'`

Adds all the files matched the pattern to the parent bundle.

#### [bundle].[simple_object]
Type: `Object`
Example: `{'main': 'assets/js/public/main'}`

Adds named module from specified filepath to the parent bundle.

#### [bundle].[feature_object]
Type: `Object`
Example: `{'backbone': {src: 'node_modules/backbone/backbone.js', deps: ['jquery', 'underscore'], exports: 'Backbone', insertRequire: true}}`

Adds named module from specified source to the parent bundle, with explicitly set dependencies.
and creates shim to make it AMD-compatible by exporting global object. Also adds require call to execute module in-place.

## API

API documentation is auto-generated into [API.md](API.md).

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code before committing.
