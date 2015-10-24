/*
 * grunt-multibundle-requirejs
 * Grunt task for handling multi-bundle requirejs setup.
 *
 * Copyright (c) 2015 Trulia Inc.
 * Licensed under the MIT license.
 */

var path        = require('path')
  , multibundle = require('multibundle')
  ;

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
        , mapper
        ;

      // keep in options components only
      delete options['_config'];

      // make sure destination dir exists
      grunt.file.mkdir(path.join(config.baseUrl, config.destination));

      // build (+ optimize)
      bundler = multibundle(config, options);

      // should be a function that returns
      // mapper instance (receiving function or writable stream)
      // Note: it needs to be wrapper into a function
      // to prevent grunt messing up with the object's state
      if (typeof config.handleMapping == 'function')
      {
        // grunt instance being passed to allow
        // for more flexible configuration in the options
        mapper = config.handleMapping(options, grunt);

        if (typeof mapper == 'function')
        {
          bundler.on('data', mapper);
          bundler.on('end', mapper);
        }
        else if (mapper)
        {
          bundler.pipe(mapper);
        }
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
