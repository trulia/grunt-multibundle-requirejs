/*
 * grunt-multibundle-requirejs
 * Grunt task for handling multi-bundle requirejs setup.
 *
 * Copyright (c) 2015 Trulia Inc.
 * Licensed under the MIT license.
 */

'use strict';

var path      = require('path')
  , crypto    = require('crypto')
    // thrid-party
  , partial   = require('lodash.partial')
  , without   = require('lodash.without')
  , uniq      = require('lodash.uniq')
  , merge     = require('deeply')
  , glob      = require('glob')
  , requirejs = require('requirejs')
    // shortcut
  , task
  ;

// Public API
module.exports = task = function(grunt)
{
  grunt.registerTask(
    'multibundle-requirejs',
    'Grunt task for handling multi-bundle requirejs setup',
    partial(task._multibundleRequirejs, grunt)
  );
};

// Private API (mostly for testing purposes)
task._multibundleRequirejs = multibundleRequirejs;
task._processComponents    = processComponents;
task._processComponentItem = processComponentItem;
task._excludeIncludes      = excludeIncludes;
task._handleOutput         = handleOutput;
task._addModule            = addModule;
task._stripExtension       = stripExtension;
task._writeMapping         = writeMapping;

/**
 * Parses multibundle config and transforms it into requirejs compatible options.
 *
 * @async
 * @private
 * @param {object} grunt - Grunt instance for external operations
 */
function multibundleRequirejs(grunt)
{
  var components
    , done    = this.async()
    , options = this.options()
    ;

  // prepare options
  // default logLevel is 1
  options['_config'].logLevel = options['_config'].logLevel || 1;

  // make list of components to process
  // exclude `_config`, and put sharedBundle first
  components = without(Object.keys(options), '_config', options['_config'].sharedBundle);

  // add sharedBundle as first element, to be processed first
  components.unshift(options['_config'].sharedBundle);

  // process all the components one by one
  task._processComponents(grunt, components, options, function(err)
  {
    // notify mapping handle, finished all the components
    // empty data - means done with the task
    task._writeMapping(options['_config'].handleMapping);

    // be nice
    if (options['_config'].logLevel < 4)
    {
      grunt.log.writeln('\n--\nAll requirejs bundles have been processed.');
    }

    // check for error
    if (err)
    {
      grunt.log.error(err);
    }

    // this is how grunt checks for async error, wat?
    done(err ? false : true);
  });
}

/**
 * Processes given component, builds mapping between bundles and contained modules,
 * and passes assembled config into requirejs optimizer.
 *
 * @async
 * @private
 * @param   {object} grunt - Grunt instance for external operations
 * @param   {array} components - list of bundles
 * @param   {object} options - task options to process
 * @param   {function} callback - `callback(error)` invoked when all components have been processed,
 * expects optional `error` argument.
 */
function processComponents(grunt, components, options, callback)
{
  var component = components.shift()
    , componentOptions
    ;

  // check if anything left to do
  if (!component)
  {
    callback();
    return;
  }

  // assemble r.js options for the component
  componentOptions =
  {
    cjsTranslate           : true,
    create                 : true,
    removeCombined         : true,
    keepBuildDir           : false,
    preserveLicenseComments: options['_config'].preserveLicenseComments || false,
    baseUrl                : options['_config'].baseUrl,
    name                   : component,
    optimize               : options['_config'].optimize || 'none',
    outFile                : path.join((options['_config'].destination || options['_config'].baseUrl), component + '.js'),
    packages               : [],
    paths                  : merge(options['_config'].paths || {}),
    shim                   : {},
    include                : [],
    insertRequire          : [],
    logLevel               : options['_config'].logLevel
  };

  // handle requirejs output "manually"
  componentOptions.out = partial(task._handleOutput, grunt, options, componentOptions);

  // fill in with modules
  options[component].forEach(task._processComponentItem.bind(this, componentOptions));

  // sharedBundle includes are excludes for other bundles
  task._excludeIncludes(componentOptions, options);

  // show all the options per component during debug (--verbose)
  grunt.verbose.writeflags(componentOptions, 'Options');

  // pass control to r.js optimizer
  requirejs.optimize(componentOptions, function()
  {
    // silent is number 4 in r.js world
    if (options['_config'].logLevel < 4)
    {
      grunt.log.writeln('Finished "' + component + '" bundle.\n');
    }

    // proceed to the next component
    task._processComponents(grunt, components, options, callback);
  },
  // error happened
  function(err)
  {
    // report upstream
    callback(err);
  });
}

/**
 * Converts component item into proper r.js component options
 *
 * @private
 * @param   {object} componentOptions - r.js options for the component
 * @param   {object|string} item - item to bundle with the component
 */
function processComponentItem(componentOptions, item)
{
  var name;

  // we can have either a string or an object
  if (typeof item == 'string')
  {
    // add item to the config
    // if item has glob patterns - unfold it
    if (glob.hasMagic(item))
    {
      // unfold path and add to include list
      // using default `process.cwd()` as base path
      componentOptions.include = componentOptions.include.concat(glob.sync(item).map(task._stripExtension));
    }
    else
    {
      componentOptions.include.push(task._stripExtension(item));
    }
  }
  else
  {
    // if its an object expect it to be single key
    name = Object.keys(item)[0];

    // add item to the config
    componentOptions.include.push(name);

    // item could be a path to the file
    // or options object with extra parameters
    if (typeof item[name] == 'string')
    {
      task._addModule(componentOptions, name, item[name]);
    }
    else
    {
      task._addModule(componentOptions, name, item[name].src);

      // process extra params
      if (item[name].exports)
      {
        componentOptions.shim[name] = {exports: item[name].exports};

        // throw dependencies into mix
        if (item[name].deps)
        {
          componentOptions.shim[name].deps = item[name].deps;
        }
      }

      // check for forced require
      if (item[name].insertRequire)
      {
        componentOptions.insertRequire.push(name);
      }
    }
  }
}

/**
 * Excludes includes of sharedBundle from other bundles
 *
 * @private
 * @param {object} componentOptions - options object for processed component
 * @param {object} options - task options
 */
function excludeIncludes(componentOptions, options)
{
  // store reference to the sharedBundle includes and modules
  if (componentOptions.name == options['_config'].sharedBundle)
  {
    options['_config'].includedInShared = componentOptions.include;
    options['_config'].modulesOfShared  = componentOptions.packages;
    options['_config'].sharedPaths      = merge(options['_config'].sharedPaths || {}, componentOptions.paths || {});
  }
  else // add it as exclude list to other bundles
  {
    componentOptions.exclude  = options['_config'].includedInShared;
    // preserve existing packages
    // based on `name` property of the package
    componentOptions.packages = uniq((componentOptions.packages || []).concat(options['_config'].modulesOfShared), 'name');
    // get shared list of paths + local per component paths take precedence
    componentOptions.paths = merge(options['_config'].sharedPaths || {}, componentOptions.paths || {});
  }
}

/**
 * Adds content based hash to the bundle files if needed,
 * and stores them on disk
 *
 * @private
 * @param {object} grunt - Grunt instance for external operations
 * @param {object} options - task options
 * @param {object} componentOptions - options object for processed component
 * @param {string} output - generated file (bundle) content
 */
function handleOutput(grunt, options, componentOptions, output)
{
  var hash;

  // if hashing is requested
  if (options['_config'].hashFiles)
  {
    // allow custom hashing functions
    if (typeof options['_config'].hashFiles == 'function')
    {
      hash = options['_config'].hashFiles(output, componentOptions);
    }
    else // use md5 by default
    {
      hash = crypto.createHash('md5').update(output).digest('hex');
    }
    // update filename
    componentOptions.outFile = componentOptions.outFile.replace(/\.js$/, '.' + hash + '.js');
  }

  // write files
  grunt.file.write(componentOptions.outFile, output);
  grunt.log.writeln('\n- Created file "' + componentOptions.outFile + '"');

  // update mapping
  // TODO: just pass componentOptions
  task._writeMapping(options['_config'].handleMapping, componentOptions);
}

/**
 * Adds module with proper path to the component options.
 *
 * @private
 * @param {object} componentOptions - options object for processed component
 * @param {string} name - name of the module
 * @param {string} src - source property of the module config
 */
function addModule(componentOptions, name, src)
{
  if (src.indexOf('node_modules/') > -1)
  {
    componentOptions.packages.push(
    {
      name: name,
      location: path.dirname(src),
      main: path.basename(task._stripExtension(src))
    });
  }
  else
  {
    componentOptions.paths[name] = task._stripExtension(src);
  }
}

/**
 * Strips extensions from the list of filenames
 *
 * @private
 * @param   {string} file - file path
 * @returns {string} - same but with stripped out extensions
 */
function stripExtension(file)
{
  return path.join(path.dirname(file), path.basename(file, path.extname(file)));
}

/**
 * Writes bundle mapping into provided handler.
 * Supports writeable streams and regular functions.
 *
 * @private
 * @param   {function|stream.Writable} handler - Writing receptor
 * @param   {object} [componentOptions] - options object for processed component
 */
function writeMapping(handler, componentOptions)
{
  // check for writable stream
  if (typeof handler.write == 'function')
  {
    // empty component or component with name, means we're done
    if (!componentOptions || !componentOptions.name)
    {
      handler.end();
    }
    else
    {
      handler.write({component: componentOptions.name, filename: componentOptions.outFile, modules: componentOptions.include});
    }
  }
  else
  {
    if (!componentOptions || !componentOptions.name)
    {
      handler();
    }
    else
    {
      handler(componentOptions.name, componentOptions.outFile, componentOptions.include);
    }
  }
}
