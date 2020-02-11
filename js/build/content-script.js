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
})({"content-script.js":[function(require,module,exports) {
var fileMap = {};
var popup = document.createElement("div");
var currentPage = "";

function urlEqual(baseURL, reference) {
  return baseURL.split("#diff")[0] === reference.split("#diff")[0];
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.message) {
    case "data":
      if (urlEqual(request.url, currentPage)) {
        return;
      }

      currentPage = request.url.split("#diff")[0];
      var files = document.querySelectorAll(".file");
      files.forEach(function (file) {
        var header = file.querySelector(".file-info > a");
        var fileName = header.textContent;
        var link = header.getAttribute("href");
        fileMap[fileName] = {
          ref: file,
          link: link
        };
      });
      console.log("DATA = ", request.data);
      request.data.refactorings.forEach(function (refactoring) {
        var beforeFile = fileMap[refactoring.before_file_name];
        var afterFile = fileMap[refactoring.after_file_name];

        if (beforeFile && afterFile) {
          addRefactorings(beforeFile.ref, "".concat(afterFile.link, "R").concat(refactoring.after_line_number), refactoring, "L");
          addRefactorings(afterFile.ref, "".concat(beforeFile.link, "L").concat(refactoring.before_line_number), refactoring, "R");
        }
      });
  }
});
window.addEventListener("load", function () {
  popup.setAttribute("class", "diff-refector-popup");
  popup.innerHTML = "\n        <button class=\"diff-refector-popup-close btn btn-sm btn-default\">x</button>\n        <p><b class=\"refactor-type\"></b></p>\n        <div class=\"refactor-content\"></div>\n        <a class=\"btn btn-sm btn-primary refactor-link\" href=\"#\">Go to source</a>\n    ";

  popup.showDiff = function (element, type, diffHTML, interval) {
    popup.style.setProperty("display", "block");
    popup.querySelector(".refactor-content").innerHTML = diffHTML;
    popup.querySelector(".refactor-type").innerText = type;

    if (interval) {
      popup.querySelector(".refactor-link").setAttribute("href", interval);
    }

    var offset = (popupPosition = popup.getBoundingClientRect().width) + 10;
    var pos = element.getBoundingClientRect();
    popup.style.setProperty("top", pos.top + "px");
    popup.style.setProperty("left", pos.left - offset + "px");
  };

  document.body.appendChild(popup);
  document.querySelector(".diff-refector-popup-close").addEventListener("click", function () {
    popup.style.setProperty("display", "none");
  });
  chrome.runtime.sendMessage({
    message: "fetch",
    url: document.location.href.split("#diff")[0]
  });
});

function addRefactorings(file, link, refactoring, side) {
  console.log("adding refactoring for ", refactoring); // right side (addiction)

  var lineNumber = refactoring.after_line_number;
  var selector = ".code-review.blob-code.blob-code-addition"; // left side (deletion)

  if (side === "L") {
    lineNumber = refactoring.before_line_number;
    selector = ".code-review.blob-code.blob-code-deletion";
  }

  file.querySelectorAll(selector).forEach(function (line) {
    if (!line.querySelector("[data-line=\"".concat(lineNumber, "\"]"))) {
      return;
    }

    var contentHTML;

    switch (refactoring.type) {
      case "RENAME":
        contentHTML = "<p><code>".concat(refactoring.before_local_name, "</code> to <code>").concat(refactoring.after_local_name, "</code></p>");
        break;

      case "MOVE":
        contentHTML = "<p><code>".concat(refactoring.before_local_name, "</code> moved.</p>");
        contentHTML += "<p>Origin: <code>".concat(refactoring.before_file_name, ":").concat(refactoring.before_line_number, "</code></p>");
        contentHTML += "<p>Destiny: <code>".concat(refactoring.after_file_name, ":").concat(refactoring.after_line_number, "</code></p>");
        break;

      default:
        contentHTML = "<p>".concat(refactoring.type, ": ").concat(refactoring.object_type, " <code>").concat(refactoring.before_local_name, "</code></p>");
        contentHTML += "<p>Origin: <code>".concat(refactoring.before_file_name, ":").concat(refactoring.before_line_number, "</code></p>");
        contentHTML += "<p>Destiny: <code>".concat(refactoring.after_file_name, ":").concat(refactoring.after_line_number, "</code></p>");
    }

    var button = document.createElement("button");
    button.setAttribute("class", "btn-refector");
    button.addEventListener("click", function () {
      popup.showDiff(button, "".concat(refactoring.type, " ").concat(refactoring.object_type), contentHTML, link);
    });
    button.innerText = "R";
    line.appendChild(button);
  });
}
},{}]},{},["content-script.js"], null)