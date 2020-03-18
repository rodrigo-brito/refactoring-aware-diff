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
var LEFT_SIDE = "left";
var RIGHT_SIDE = "right";
var fileMap = {};
var popup = document.createElement("div");
var currentPage = "";
/**
 * Check if Github URLs are equal
 * @param {String} baseURL
 * @param {String} reference
 */

function urlEqual(baseURL, reference) {
  return baseURL.split("#diff")[0] === reference.split("#diff")[0];
}
/**
 * Update global file map after url change
 */


function updateFileMap() {
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
  return files.length > 0;
}
/**
 * Register an event in analytics
 * @param {String} category
 * @param {String} action
 */


function sendEvent(category, action) {
  console.log("sending event...");
  chrome.runtime.sendMessage({
    message: "event",
    category: category,
    action: action
  }, function (res) {
    console.log("event res = ", res);
  });
}
/**
 * Message receiver to handle data
 */


chrome.runtime.onMessage.addListener(function (request) {
  var delayToUpdate = 0;

  switch (request.message) {
    case "data":
      if (urlEqual(request.url, currentPage)) {
        return;
      }

      popup.style.setProperty("display", "none");
      currentPage = request.url.split("#diff")[0]; // check if diff files are loaded

      if (!updateFileMap()) {
        delayToUpdate = 2000; // 1 sec.
      }

      setTimeout(function () {
        if (delayToUpdate > 0) {
          updateFileMap();
        } // avoid insert duplication with delayed requests


        if (document.querySelector(".btn-refector")) {
          return;
        }

        request.data.refactorings.forEach(function (refactoring) {
          addRefactorings(fileMap, refactoring, LEFT_SIDE);
          addRefactorings(fileMap, refactoring, RIGHT_SIDE);
        });
      }, delayToUpdate);
  }
});
/**
 * Plugin initialization after page load
 */

window.addEventListener("load", function () {
  popup.setAttribute("class", "diff-refector-popup");
  popup.innerHTML = "\n        <button class=\"diff-refector-popup-close btn btn-sm btn-default\">x</button>\n        <p><b class=\"refactor-type\"></b></p>\n        <div class=\"refactor-content\"></div>\n        <a class=\"btn btn-sm btn-primary refactor-link\" href=\"#\">Go to source</a>\n    ";

  popup.show = function (element, type, diffHTML, link, buttonText) {
    popup.style.setProperty("display", "block");
    popup.querySelector(".refactor-content").innerHTML = diffHTML;
    popup.querySelector(".refactor-type").innerText = type;

    if (link) {
      var button = popup.querySelector(".refactor-link");
      button.setAttribute("href", link);
      button.textContent = buttonText;
    } // pop-up offset to align box in left side


    var offset = popup.getBoundingClientRect().width + 10;
    var bounds = element.getBoundingClientRect();
    var left = (window.pageXOffset || element.scrollLeft) + bounds.left;
    var top = (window.pageYOffset || element.scrollTop) + bounds.top;
    popup.style.setProperty("top", top + "px");
    popup.style.setProperty("left", left - offset + "px");
    sendEvent("open", type);
  };

  document.body.appendChild(popup);
  document.querySelector(".diff-refector-popup-close").addEventListener("click", function () {
    popup.style.setProperty("display", "none");
  }); // Request background task refactorings

  chrome.runtime.sendMessage({
    message: "fetch",
    url: document.location.href.split("#diff")[0]
  });
});
/**
 *
 * @param {Object} fileMap pair of file and page anchor
 * @param {Object} refactoring refactoring data
 * @param {LEFT_SIDE|RIGHT_SIDE} side diff side
 */

function addRefactorings(fileMap, refactoring, side) {
  var beforeFile = fileMap[refactoring.before_file_name];
  var afterFile = fileMap[refactoring.after_file_name];

  if (!beforeFile || !afterFile) {
    return;
  } // right side (addiction)


  var lineNumber = refactoring.after_line_number;
  var selector = ".blob-code.blob-code-addition";
  var buttonText = "Go to source";
  var baseFile = afterFile.ref;
  var link = "".concat(beforeFile.link, "L").concat(refactoring.before_line_number); // left side (deletion)

  if (side === LEFT_SIDE) {
    lineNumber = refactoring.before_line_number;
    selector = ".blob-code.blob-code-deletion";
    buttonText = "Go to target";
    baseFile = beforeFile.ref;
    link = "".concat(afterFile.link, "R").concat(refactoring.after_line_number);
  }

  baseFile.querySelectorAll(selector).forEach(function (line) {
    if (!line.querySelector("[data-line=\"".concat(lineNumber, "\"]"))) {
      return;
    }

    var contentHTML;
    var title = "".concat(refactoring.type, " ").concat(refactoring.object_type);

    switch (refactoring.type) {
      case "RENAME":
        contentHTML = "<p><code>".concat(refactoring.before_local_name, "</code> renamed to <code>").concat(refactoring.after_local_name, "</code></p>");
        break;

      case "MOVE":
        contentHTML = "<p><code>".concat(refactoring.object_type.toLowerCase(), " ").concat(refactoring.before_local_name, "</code> moved.</p>");
        contentHTML += "<p>Source: <code>".concat(refactoring.before_file_name, ":").concat(refactoring.before_line_number, "</code></p>");
        contentHTML += "<p>Target: <code>".concat(refactoring.after_file_name, ":").concat(refactoring.after_line_number, "</code></p>");
        break;

      case "EXTRACT_SUPER":
        title = "EXTRACT " + refactoring.object_type.toUpperCase();
        contentHTML = "<p>".concat(refactoring.object_type.toLowerCase(), " <code> ").concat(refactoring.after_local_name, "</code> extracted from class <code>").concat(refactoring.before_local_name, "</code>.</p>");
        contentHTML += "<p>Source: <code>".concat(refactoring.before_file_name, ":").concat(refactoring.before_line_number, "</code></p>");
        contentHTML += "<p>Target: <code>".concat(refactoring.after_file_name, ":").concat(refactoring.after_line_number, "</code></p>");
        break;

      case "EXTRACT":
        contentHTML = "<p>".concat(refactoring.object_type.toLowerCase(), " <code>").concat(refactoring.after_local_name, "</code> extracted from <code>").concat(refactoring.object_type.toLowerCase(), " ").concat(refactoring.before_local_name, "</code>.</p>");
        contentHTML += "<p>Source: <code>".concat(refactoring.before_file_name, ":").concat(refactoring.before_line_number, "</code></p>");
        contentHTML += "<p>Target: <code>".concat(refactoring.after_file_name, ":").concat(refactoring.after_line_number, "</code></p>");
        break;

      default:
        refactoring.type = refactoring.type.replace("_", " ");
        title = "".concat(refactoring.type, " ").concat(refactoring.object_type);
        contentHTML = "<p>".concat(refactoring.type, ": ").concat(refactoring.object_type.toLowerCase(), " <code>").concat(refactoring.before_local_name, "</code></p>");
        contentHTML += "<p>Source: <code>".concat(refactoring.before_file_name, ":").concat(refactoring.before_line_number, "</code></p>");
        contentHTML += "<p>Target: <code>".concat(refactoring.after_file_name, ":").concat(refactoring.after_line_number, "</code></p>");
    }

    var button = document.createElement("button");
    button.setAttribute("class", "btn-refector");
    button.addEventListener("click", function () {
      popup.show(button, title, contentHTML, link, buttonText);
    });
    button.innerText = "R";
    line.appendChild(button);
  });
}
},{}]},{},["content-script.js"], null)