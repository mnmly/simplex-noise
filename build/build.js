
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("simplex-noise/index.js", Function("exports, require, module",
"// Ported from Stefan Gustavson's java implementation\n// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf\n// Read Stefan's excellent paper for details on how this code works.\n//\n// Sean McCullough banksean@gmail.com\n\n/**\n * You can pass in a random number generator object if you like.\n * It is assumed to have a random() method.\n */\n\nmodule.exports = SimplexNoise;\n\nfunction SimplexNoise(r) {\n\tif (r == undefined) r = Math;\n  this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], \n                                 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], \n                                 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; \n  this.p = [];\n  for (var i=0; i<256; i++) {\n\t  this.p[i] = Math.floor(r.random()*256);\n  }\n  // To remove the need for index wrapping, double the permutation table length \n  this.perm = []; \n  for(var i=0; i<512; i++) {\n\t\tthis.perm[i]=this.p[i & 255];\n\t} \n\n  // A lookup table to traverse the simplex around a given point in 4D. \n  // Details can be found where this table is used, in the 4D noise method. \n  this.simplex = [ \n    [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], \n    [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], \n    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], \n    [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], \n    [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], \n    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], \n    [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], \n    [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]; \n};\n\nSimplexNoise.prototype.dot = function(g, x, y) { \n\treturn g[0]*x + g[1]*y;\n};\n\nSimplexNoise.prototype.noise = function(xin, yin) { \n  var n0, n1, n2; // Noise contributions from the three corners \n  // Skew the input space to determine which simplex cell we're in \n  var F2 = 0.5*(Math.sqrt(3.0)-1.0); \n  var s = (xin+yin)*F2; // Hairy factor for 2D \n  var i = Math.floor(xin+s); \n  var j = Math.floor(yin+s); \n  var G2 = (3.0-Math.sqrt(3.0))/6.0; \n  var t = (i+j)*G2; \n  var X0 = i-t; // Unskew the cell origin back to (x,y) space \n  var Y0 = j-t; \n  var x0 = xin-X0; // The x,y distances from the cell origin \n  var y0 = yin-Y0; \n  // For the 2D case, the simplex shape is an equilateral triangle. \n  // Determine which simplex we are in. \n  var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords \n  if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1) \n  else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1) \n  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and \n  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where \n  // c = (3-sqrt(3))/6 \n  var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords \n  var y1 = y0 - j1 + G2; \n  var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords \n  var y2 = y0 - 1.0 + 2.0 * G2; \n  // Work out the hashed gradient indices of the three simplex corners \n  var ii = i & 255; \n  var jj = j & 255; \n  var gi0 = this.perm[ii+this.perm[jj]] % 12; \n  var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12; \n  var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12; \n  // Calculate the contribution from the three corners \n  var t0 = 0.5 - x0*x0-y0*y0; \n  if(t0<0) n0 = 0.0; \n  else { \n    t0 *= t0; \n    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient \n  } \n  var t1 = 0.5 - x1*x1-y1*y1; \n  if(t1<0) n1 = 0.0; \n  else { \n    t1 *= t1; \n    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); \n  }\n  var t2 = 0.5 - x2*x2-y2*y2; \n  if(t2<0) n2 = 0.0; \n  else { \n    t2 *= t2; \n    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); \n  } \n  // Add contributions from each corner to get the final noise value. \n  // The result is scaled to return values in the interval [-1,1]. \n  return 70.0 * (n0 + n1 + n2); \n};\n\n// 3D simplex noise \nSimplexNoise.prototype.noise3d = function(xin, yin, zin) { \n  var n0, n1, n2, n3; // Noise contributions from the four corners \n  // Skew the input space to determine which simplex cell we're in \n  var F3 = 1.0/3.0; \n  var s = (xin+yin+zin)*F3; // Very nice and simple skew factor for 3D \n  var i = Math.floor(xin+s); \n  var j = Math.floor(yin+s); \n  var k = Math.floor(zin+s); \n  var G3 = 1.0/6.0; // Very nice and simple unskew factor, too \n  var t = (i+j+k)*G3; \n  var X0 = i-t; // Unskew the cell origin back to (x,y,z) space \n  var Y0 = j-t; \n  var Z0 = k-t; \n  var x0 = xin-X0; // The x,y,z distances from the cell origin \n  var y0 = yin-Y0; \n  var z0 = zin-Z0; \n  // For the 3D case, the simplex shape is a slightly irregular tetrahedron. \n  // Determine which simplex we are in. \n  var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords \n  var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords \n  if(x0>=y0) { \n    if(y0>=z0) \n      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; } // X Y Z order \n      else if(x0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; } // X Z Y order \n      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; } // Z X Y order \n    } \n  else { // x0<y0 \n    if(y0<z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; } // Z Y X order \n    else if(x0<z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; } // Y Z X order \n    else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; } // Y X Z order \n  } \n  // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z), \n  // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and \n  // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where \n  // c = 1/6.\n  var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords \n  var y1 = y0 - j1 + G3; \n  var z1 = z0 - k1 + G3; \n  var x2 = x0 - i2 + 2.0*G3; // Offsets for third corner in (x,y,z) coords \n  var y2 = y0 - j2 + 2.0*G3; \n  var z2 = z0 - k2 + 2.0*G3; \n  var x3 = x0 - 1.0 + 3.0*G3; // Offsets for last corner in (x,y,z) coords \n  var y3 = y0 - 1.0 + 3.0*G3; \n  var z3 = z0 - 1.0 + 3.0*G3; \n  // Work out the hashed gradient indices of the four simplex corners \n  var ii = i & 255; \n  var jj = j & 255; \n  var kk = k & 255; \n  var gi0 = this.perm[ii+this.perm[jj+this.perm[kk]]] % 12; \n  var gi1 = this.perm[ii+i1+this.perm[jj+j1+this.perm[kk+k1]]] % 12; \n  var gi2 = this.perm[ii+i2+this.perm[jj+j2+this.perm[kk+k2]]] % 12; \n  var gi3 = this.perm[ii+1+this.perm[jj+1+this.perm[kk+1]]] % 12; \n  // Calculate the contribution from the four corners \n  var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0; \n  if(t0<0) n0 = 0.0; \n  else { \n    t0 *= t0; \n    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0); \n  }\n  var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1; \n  if(t1<0) n1 = 0.0; \n  else { \n    t1 *= t1; \n    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1); \n  } \n  var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2; \n  if(t2<0) n2 = 0.0; \n  else { \n    t2 *= t2; \n    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2); \n  } \n  var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3; \n  if(t3<0) n3 = 0.0; \n  else { \n    t3 *= t3; \n    n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3); \n  } \n  // Add contributions from each corner to get the final noise value. \n  // The result is scaled to stay just inside [-1,1] \n  return 32.0*(n0 + n1 + n2 + n3); \n};\n//@ sourceURL=simplex-noise/index.js"
));

