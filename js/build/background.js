// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
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

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"background.js":[function(require,module,exports) {
// Standard Google Universal Analytics code
(function (i, s, o, g, r, a, m) {
  i["GoogleAnalyticsObject"] = r;
  i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments);
  }, i[r].l = 1 * new Date();
  a = s.createElement(o), m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
})(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga");

ga("create", "UA-35546390-8", "auto");
ga("set", "checkProtocolTask", function () {}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200

ga("require", "displayfeatures");
ga("send", "pageview", "/");
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (!changeInfo.url) {
    return;
  }

  fetchData(changeInfo.url, function (data) {
    chrome.tabs.sendMessage(tabId, {
      url: changeInfo.url,
      message: "data",
      data: data
    });
  });
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.message) {
    case "fetch":
      fetchData(request.url, function (data) {
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            url: request.url,
            message: "data",
            data: data
          });
        });
      });
      break;

    case "event":
      ga("send", "event", request.category, request.action);
      sendResponse({
        send: true
      });
  }
});

function fetchData(url, callback) {
  var regex = /github\.com\/([\w_-]+)\/([\w_-]+)\/pull\/(\d+)/g;
  var urlParts = regex.exec(url);

  if (!urlParts) {
    return;
  }

  fetch("https://refdiff.brito.com.br/".concat(urlParts[1], "/").concat(urlParts[2], "/").concat(urlParts[3], "?t=").concat(+new Date()) // TODO remove seed
  ).then(function (response) {
    return response.json();
  }).then(function (data) {
    callback(data);
  });
}
},{}]},{},["background.js"], null)