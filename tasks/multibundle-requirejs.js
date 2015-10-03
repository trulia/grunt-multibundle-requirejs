/*
 * grunt-multibundle-requirejs
 * Grunt task for handling multi-bundle requirejs setup.
 *
 * Copyright (c) 2015 Trulia Inc.
 * Licensed under the MIT license.
 */

var multibundle = require('multibundle');

// Public API
module.exports = function(grunt)
{
  grunt.registerTask(
    'multibundle-requirejs',
    'Grunt task for handling multibundle requirejs setup',
    function()
    {
      var done    = this.async()
        , options = this.options()
        , config  = options['_config']
        , bundler
        ;

      // keep in options components only
      delete options['_config'];

      // optimize
      bundler = multibundle(config, options);

      // allow for `handleMapping` to be a writable stream
      // or a simple function
      if (typeof config.handleMapping == 'function')
      {
        bundler.on('data', config.handleMapping);
        bundler.on('end', config.handleMapping);
      }
      else if (config.handleMapping)
      {
        bundler.pipe(config.handleMapping);
      }

      bundler.on('end', function()
      {
        done(true);
      });

      bundler.on('error', function(error)
      {
        if (error) grunt.log.error('Could not process some bundles', error);
        done(false);
      });
    }
  );
};
