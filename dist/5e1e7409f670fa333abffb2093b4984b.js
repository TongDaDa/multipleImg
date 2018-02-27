// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }
      
      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module;

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({8:[function(require,module,exports) {
(function(a, b) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = b())
    : 'function' == typeof define && define.amd ? define(b) : (a.retinajs = b());
})(this, function() {
  'use strict';
  function a(a) {
    return Array.prototype.slice.call(a);
  }
  function b(a) {
    var b = parseInt(a, 10);
    return k < b ? k : b;
  }
  function c(a) {
    return (
      a.hasAttribute('data-no-resize') ||
        (0 === a.offsetWidth && 0 === a.offsetHeight
          ? (a.setAttribute('width', a.naturalWidth), a.setAttribute('height', a.naturalHeight))
          : (a.setAttribute('width', a.offsetWidth), a.setAttribute('height', a.offsetHeight))),
      a
    );
  }
  function d(a, b) {
    var d = a.nodeName.toLowerCase(),
      e = document.createElement('img');
    e.addEventListener('load', function() {
      'img' === d ? c(a).setAttribute('src', b) : (a.style.backgroundImage = 'url(' + b + ')');
    }),
      e.setAttribute('src', b),
      a.setAttribute(o, !0);
  }
  function e(a, c) {
    var e = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 1,
      f = b(e);
    if (c && 1 < f) {
      var g = c.replace(l, '@' + f + 'x$1');
      d(a, g);
    }
  }
  function f(a, b, c) {
    1 < k && d(a, c);
  }
  function g(b) {
    return b
      ? 'function' == typeof b.forEach ? b : a(b)
      : 'undefined' == typeof document ? [] : a(document.querySelectorAll(n));
  }
  function h(a) {
    return a.style.backgroundImage.replace(m, '$2');
  }
  function i(a) {
    g(a).forEach(function(a) {
      if (!a.getAttribute(o)) {
        var b = 'img' === a.nodeName.toLowerCase(),
          c = b ? a.getAttribute('src') : h(a),
          d = a.getAttribute('data-rjs'),
          g = !isNaN(parseInt(d, 10));
        if (null === d) return;
        g ? e(a, c, d) : f(a, c, d);
      }
    });
  }
  var j = 'undefined' != typeof window,
    k = Math.round(j ? window.devicePixelRatio || 1 : 1),
    l = /(\.[A-z]{3,4}\/?(\?.*)?)$/,
    m = /url\(('|")?([^)'"]+)('|")?\)/i,
    n = '[data-rjs]',
    o = 'data-rjs-processed';
  return (
    j &&
      (window.addEventListener('load', function() {
        i();
      }),
      (window.retinajs = i)),
    i
  );
});

},{}],4:[function(require,module,exports) {
"use strict";

var _retinajs = require("retinajs");

var _retinajs2 = _interopRequireDefault(_retinajs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_retinajs2.default);
},{"retinajs":8}],0:[function(require,module,exports) {
var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module() {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent && typeof WebSocket !== 'undefined') {
  var ws = new WebSocket('ws://' + window.location.hostname + ':63620/');
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        window.location.reload();
      }
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id)
  });
}
},{}]},{},[0,4])