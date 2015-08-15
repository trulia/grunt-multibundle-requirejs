/**
 * Example config to use with grunt-multibundle-requirejs
 * usually something you'd put into your `Grunt/options` folder
 */

module.exports =
{
  options:
  {
    // general config
    '_config':
    {
      // 4 is silent in r.js world
      logLevel: process.env.quiet ? 4 : 1,
      destination: 'public/js',
      sharedBundle: 'common',
      // or custom function `hashFiles(output, componentOptions)`
      hashFiles: true,
      // will be called one extra time with no arguments after all the bundles processed
      // also accepts writable streams in object mode, (e.g. `multibundle-requirejs-mapping-write`)
      handleMapping: function(component, filename, includedModules)
      {
        console.log('handleMapping', component, filename, includedModules);
      },
      // pass options to r.js
      baseUrl: '.',
      optimize: 'uglify',
      paths:
      {
        'rendr': 'node_modules/rendr'
      },
      preserveLicenseComments: false
    },

    // Creates `<destination>/common.<hash>.js` file that includes all the modules specified in the bundle,
    // shared modules between all the pages.
    // And minifies them along the way. `<hash>` is md5 hash for generated file.
    // Plus it updates `config/<configFile>.json`
    // with generated filename, modifying `appData.static.js.common` node.
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

      // checked in assets
      {'hammer'       : 'assets/js/vendor/hammer'},
      {'nouislider'   : 'assets/js/vendor/jquery.nouislider.min'},

      // assets needed to be shimmed
      {'jquery'       : {src: 'assets/js/vendor/jquery', exports: 'jQuery'}},

      // execute plugin to add methods to jQuery
      {'jqueryHammer' : {src: 'assets/js/vendor/jquery.hammer', insertRequire: true}},

      // config/trigger
      {'main'         : 'assets/js/public/main'},

      // base app files
      'app/*.js',

      // global actions
      'app/actions/*.js',

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
};
