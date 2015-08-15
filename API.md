## Functions
<dl>
<dt><a href="#multibundleRequirejs">`multibundleRequirejs(grunt)`</a> ℗</dt>
<dd><p>Parses multibundle config and transforms it into requirejs compatible options.</p>
</dd>
<dt><a href="#processComponents">`processComponents(grunt, components, options, callback)`</a> ℗</dt>
<dd><p>Processes given component, builds mapping between bundles and contained modules,
and passes assembled config into requirejs optimizer.</p>
</dd>
<dt><a href="#processComponentItem">`processComponentItem(componentOptions, item)`</a> ℗</dt>
<dd><p>Converts component item into proper r.js component options</p>
</dd>
<dt><a href="#excludeIncludes">`excludeIncludes(componentOptions, options)`</a> ℗</dt>
<dd><p>Excludes includes of sharedBundle from other bundles</p>
</dd>
<dt><a href="#handleOutput">`handleOutput(grunt, options, componentOptions, output)`</a> ℗</dt>
<dd><p>Adds content based hash to the bundle files if needed,
and stores them on disk</p>
</dd>
<dt><a href="#addModule">`addModule(componentOptions, name, src)`</a> ℗</dt>
<dd><p>Adds module with proper path to the component options.</p>
</dd>
<dt><a href="#stripExtension">`stripExtension(file)`</a> ⇒ <code>string</code> ℗</dt>
<dd><p>Strips extensions from the list of filenames</p>
</dd>
<dt><a href="#writeMapping">`writeMapping(handler, [componentOptions])`</a> ℗</dt>
<dd><p>Writes bundle mapping into provided handler.
Supports writeable streams and regular functions.</p>
</dd>
</dl>
<a name="multibundleRequirejs"></a>
## `multibundleRequirejs(grunt)` ℗
Parses multibundle config and transforms it into requirejs compatible options.

**Kind**: global function  
**Access:** private  
**Async**:   
**Params**
- grunt <code>object</code> - Grunt instance for external operations


-

<a name="processComponents"></a>
## `processComponents(grunt, components, options, callback)` ℗
Processes given component, builds mapping between bundles and contained modules,
and passes assembled config into requirejs optimizer.

**Kind**: global function  
**Access:** private  
**Async**:   
**Params**
- grunt <code>object</code> - Grunt instance for external operations
- components <code>array</code> - list of bundles
- options <code>object</code> - task options to process
- callback <code>function</code> - `callback(error)` invoked when all components have been processed,
expects optional `error` argument.


-

<a name="processComponentItem"></a>
## `processComponentItem(componentOptions, item)` ℗
Converts component item into proper r.js component options

**Kind**: global function  
**Access:** private  
**Params**
- componentOptions <code>object</code> - r.js options for the component
- item <code>object</code> | <code>string</code> - item to bundle with the component


-

<a name="excludeIncludes"></a>
## `excludeIncludes(componentOptions, options)` ℗
Excludes includes of sharedBundle from other bundles

**Kind**: global function  
**Access:** private  
**Params**
- componentOptions <code>object</code> - options object for processed component
- options <code>object</code> - task options


-

<a name="handleOutput"></a>
## `handleOutput(grunt, options, componentOptions, output)` ℗
Adds content based hash to the bundle files if needed,
and stores them on disk

**Kind**: global function  
**Access:** private  
**Params**
- grunt <code>object</code> - Grunt instance for external operations
- options <code>object</code> - task options
- componentOptions <code>object</code> - options object for processed component
- output <code>string</code> - generated file (bundle) content


-

<a name="addModule"></a>
## `addModule(componentOptions, name, src)` ℗
Adds module with proper path to the component options.

**Kind**: global function  
**Access:** private  
**Params**
- componentOptions <code>object</code> - options object for processed component
- name <code>string</code> - name of the module
- src <code>string</code> - source property of the module config


-

<a name="stripExtension"></a>
## `stripExtension(file)` ⇒ <code>string</code> ℗
Strips extensions from the list of filenames

**Kind**: global function  
**Returns**: <code>string</code> - - same but with stripped out extensions  
**Access:** private  
**Params**
- file <code>string</code> - file path


-

<a name="writeMapping"></a>
## `writeMapping(handler, [componentOptions])` ℗
Writes bundle mapping into provided handler.
Supports writeable streams and regular functions.

**Kind**: global function  
**Access:** private  
**Params**
- handler <code>function</code> | <code>stream.Writable</code> - Writing receptor
- [componentOptions] <code>object</code> - options object for processed component


-

