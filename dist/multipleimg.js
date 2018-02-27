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
})({7:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var MATCH_ATTRIBUTE = /^dpr-[\d]+$/;
var IMG_TIMEOUT = 5000;
var criticalValue = false;

/**
 * @param {*} url
 * @return Promise
 * var loadImg = pingimgPromise("http://wwww.img.ong").
 * then((success)=>{  },(err)=>{})
 */
var pingimgPromise = function pingimgPromise(url) {
  var Img = new Image();
  return new Promise(function (reslove, reject) {
    Img.onload = function () {
      reslove("success");
    };
    Img.onerror = function () {
      reject("error");
    };
    setTimeout(function () {
      reject("timeout");
    }, IMG_TIMEOUT);
    Img.src = url;
  });
};

var arrayify = function arrayify(obj) {
  return Array.prototype.slice.call(obj);
};

/**
 * @param ele
 * @return {Array}
 */
var getAttributeNames = function getAttributeNames(ele) {
  var attrs = [],
      matchAttrs = [];
  if (ele.getAttributeNames) {
    attrs = ele.getAttributeNames();
  } else {
    attrs = [].slice.call(ele.attributes);
  }
  for (var i = 0; i < attrs.length; i++) {
    if (MATCH_ATTRIBUTE.test(attrs[i])) {
      matchAttrs.push(attrs[i]);
    }
  }
  return matchAttrs;
};

var getGlobalImages = function getGlobalImages() {
  var imagesArr = document.getElementsByTagName('img');
  return arrayify(imagesArr);
};

/**
 * note: as DOMElement return multiple scale
 * @param ele
 * @return [{scale:Number,src:URL}]
 */
var getDprAttr = function getDprAttr(ele) {
  var attrs = getAttributeNames(ele);
  var drs = [];
  for (var i = 0; i < attrs.length; ++i) {
    drs.push({
      scale: attrs[i].replace(/^dpr-/, ""),
      src: ele.getAttribute(attrs[i])
    });
  }
  return drs;
};

var getDprRatio = function getDprRatio() {
  if (window && window.devicePixelRatio) {
    return Math.round(window.devicePixelRatio);
  } else {
    return 1;
  }
};

/**
 * @param dprs{Array} ->> [{scale:Number,src:Source_URL}]
 * @param cb{Function} param1{}
 * @return
 */
function matchDprSrc(dprs, cb) {
  var rat = getDprRatio();
  var matchDpr = [];
  if (Array.isArray(dprs)) {
    matchDpr = dprs.filter(function (imgItem) {
      return rat === parseInt(imgItem.scale, 10);
    });
    if (matchDpr.length >= 1) {
      cb && cb(matchDpr[0].src);
    } else {
      var positive = [],
          negative = [];
      var arr = dprs.map(function (imgItem) {
        return { subTract: imgItem.scale - rat, src: imgItem.src };
      });
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] >= 0) {
          positive.push(arr[i]);
        } else {
          negative.push(arr[i]);
        }
      }
      matchDpr = criticalValue ? positive.sort(function (a, b) {
        a = a.subTract;b = b.subTract;return a - b;
      }) : negative.sort(function (a, b) {
        a = a.subTract;b = b.subTract;return b - a;
      });
      cb && cb(matchDpr[0].src);
    }
  }
}

/**
 * @param ele{HTMLDOMElement}
 * @return undefined
 */
var clearAttribute = function clearAttribute(ele) {
  var dprAttrs = getAttributeNames(ele);
  for (var i = 0; i < dprAttrs.length; i++) {
    ele.removeAttribute(dprAttrs[i]);
  }
};

/**
 * @param images{Array|Object}?  HTMLImageElement
 * @param options{Object}? Object
 * @return undefined
 */
function multipleImg(images) {
  if (images) {
    if (!Array.isArray(images)) {
      images = [images];
    }
    images.forEach(function (image) {
      var dprs = getDprAttr(image);
      matchDprSrc(dprs, function (src) {
        pingimgPromise(src).then(function () {
          image.setAttribute('src', src);
          clearAttribute(image);
        }).catch(function (err) {
          console.warn("multipleImg.js load img lose, use default src url");
          clearAttribute(image);
        });
      });
    });
  } else {
    var globalImgs = getGlobalImages();
    multipleImg(globalImgs);
  }
}

if (window) {
  window.addEventListener('load', function () {
    window.multipleImg = multipleImg;
  });
}

exports.default = multipleImg;
},{}],5:[function(require,module,exports) {
"use strict";

module.exports = require('./src/multipleImg');
},{"./src/multipleImg":7}],0:[function(require,module,exports) {
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
  var ws = new WebSocket('ws://' + window.location.hostname + ':64582/');
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
},{}]},{},[0,5])