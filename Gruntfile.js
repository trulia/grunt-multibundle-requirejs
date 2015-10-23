var assert = require('assert');
var expectedBundles = 4;

module.exports = function(grunt)
{
  var options;

  // Project configuration.
  grunt.initConfig(options = {

    'eslint':
    {
      options:
      {
        configFile: '.eslintrc'
      },
      target: ['tasks/multibundle-requirejs.js']
    },

    'clean':
    {
      tests: ['test/tmp']
    },

    'file_compare':
    {
      check_common  : ['test/fixtures/expected/common.d8cbdeb1970daacdc70c01c3306e31c7.js', 'test/tmp/common.d8cbdeb1970daacdc70c01c3306e31c7.js'],
      check_maps    : ['test/fixtures/expected/maps.b371bd03bd498257ded2aae300de5d13.js', 'test/tmp/maps.b371bd03bd498257ded2aae300de5d13.js'],
      check_optional: ['test/fixtures/expected/optional.f242c6ec7db101d485e624c441061180.js', 'test/tmp/optional.f242c6ec7db101d485e624c441061180.js'],
      check_user    : ['test/fixtures/expected/user.2a25559b93ae406914f97d940e98aa3d.js', 'test/tmp/user.2a25559b93ae406914f97d940e98aa3d.js']
    },

    // Configuration to be run (and then tested).
    'multibundle-requirejs':
    {
      options:
      {
        '_config':
        {
          // 4 is silent in r.js world
          logLevel: process.env.quiet ? 4 : 1,
          destination: 'test/tmp',
          sharedBundles: ['optional', 'common'],
          // or custom function `hashFiles(output, componentOptions)`
          hashFiles: true,
          // will be called one extra time with no arguments after all the bundles processed
          // also accepts writable streams in object mode, (e.g. `multibundle-requirejs-mapping-write`)
          handleMapping: function(buildObject)
          {
            // it will be invoked for each bundle with respective buildObject
            if (buildObject)
            {
              assert(buildObject.name in options['multibundle-requirejs'].options);
              expectedBundles--;
            }
            // and without arguments after all bundles have been processed
            else
            {
              assert.strictEqual(0, expectedBundles);
            }
          },
          // pass options to r.js
          baseUrl: '.',
          optimize: 'uglify',
          sharedPaths:
          {
            // test location namespacing
            'app'   : 'test/fixtures/input/app',
            'assets': 'test/fixtures/input/assets',
            // needed for rendr modules
            'rendr' : 'node_modules/rendr'
          },
          preserveLicenseComments: false
        },

        // optional modules
        'optional':
        [
          {'omniture' : 'assets/vendor/s_code.js'},

          'app/lib/tracking/pixel.js',
          'app/lib/tracking/omniture.js'
        ],

        // Creates `<destination>/common.<hash>.js` file that includes all the modules specified in the bundle,
        // shared modules between all the pages.
        'common':
        [
          // node modules
          {'requirejs'    : 'node_modules/requirejs/require.js'},

          // multiple entry points module
          {'rendr/shared' : 'node_modules/rendr/shared/app.js'},
          {'rendr/client' : 'node_modules/rendr/client/router.js'},

          // modules needed to be shimmed
          {'async'        : {src: 'node_modules/async/lib/async.js', exports: 'async'}},
          // module with implicit dependencies
          {'backbone'     : {src: 'node_modules/backbone/backbone.js', deps: ['jquery', 'underscore', 'jqueryHammer'], exports: 'Backbone'}},

          // replace underscore with lodash
          {'underscore'   : {src: 'node_modules/lodash/index.js', exports: '_'}},

          // checked in assets
          {'hammer'       : 'assets/vendor/hammer.js'},

          // assets needed to be shimmed
          {'jquery'       : {src: 'assets/vendor/jquery.js', exports: 'jQuery'}},

          // execute plugin to add methods to jQuery
          {'jqueryHammer' : {src: 'assets/vendor/jquery.hammer.js', deps: ['jquery', 'hammer'] , insertRequire: true}},

          // main script
          {'main'         : 'app/main.js'},

          // app helper files
          'app/helper*.js',

          // lib
          'app/lib/**/*.js'
        ],

        // Creates separate bundle for user page components – `<destination>/user.<hash>.js`
        'user':
        [
          'app/models/user/**/*.js',
          'app/views/user/**/*.js'
        ],

        // Creates separate bundle for map page components – `<destination>/maps.<hash>.js`
        'maps':
        [
          'app/models/maps/**/*.js',
          'app/views/maps/**/*.js'
        ]
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-file-compare');

  // Whenever the "test" task is run, run this plugin's task(s),
  // then test the result.
  grunt.registerTask('test', ['clean', 'multibundle-requirejs', 'file_compare']);

  // use eslint for linting
  grunt.registerTask('lint', ['eslint']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['lint', 'test']);

};
