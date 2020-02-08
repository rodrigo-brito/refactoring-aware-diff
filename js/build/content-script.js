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
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.message) {
    case "data":
      console.log(request.data);
      request.data.refactorings.forEach(function (refactoring) {
        var file = fileMap[refactoring.after_file_name]; // TODO: change for before

        if (file) {
          addRefactorings(file.ref, file.link, refactoring);
        } else {
          console.error("not found reference for " + refactoring.after_file_name);
        }
      });
      break;

    default:
      console.log("others: " + request);
  }
});
window.addEventListener("load", function () {
  popup.setAttribute("class", "diff-refector-popup");
  popup.innerHTML = "\n        <button class=\"diff-refector-popup-close btn btn-sm btn-default\">x</button>\n        <p><b>Type:</b> <span class=\"refactor-type\">Move Method</span></p>\n        <div class=\"refactor-diff\"></div>\n        <a class=\"btn btn-sm btn-primary refactor-link\" href=\"#\">Go to block</a>\n    ";

  popup.showDiff = function (element, type, diffHTML, interval) {
    popup.style.setProperty("display", "block");
    popup.querySelector(".refactor-diff").innerHTML = diffHTML;
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
  var files = document.querySelectorAll(".file");
  files.forEach(function (file) {
    var header = file.querySelector(".file-info > a");
    var fileName = header.textContent;
    var link = header.getAttribute("href");
    console.log("File=" + fileName + " Link=" + link);
    fileMap[fileName] = {
      ref: file,
      link: link
    };
  });
  chrome.runtime.sendMessage({
    message: "fetch",
    url: document.location.href
  });
});

function addRefactorings(file, link, refactoring) {
  console.log("adding refactoring for ", refactoring);
  console.log("REF = ", file);
  file.querySelectorAll(".code-review.blob-code.blob-code-deletion").forEach(function (line) {
    console.log("seraching for ", refactoring.before_line_number);

    if (!line.querySelector("[data-line=\"".concat(refactoring.before_line_number, "\"]"))) {
      return;
    }

    console.log("found line!!!!");
    var button = document.createElement("button");
    button.setAttribute("class", "btn-refector");
    button.addEventListener("click", function () {
      var moveMethodDiff = "diff --git a/Example.java b/Example.java\nindex aa5aefd..36cbde8 100644\n--- a/Example.java\n+++ b/Example.java\n@@ -1,20 +1,9 @@\n import java.io.*;\n \n public class Example {\n\tpublic void DoNothing() {\n-\t\tSystem.out.println(\"do nothing\");\n+\t\tSystem.out.println(\"do something\");\n\t}\n";
      var moveMethodHTML = Diff2Html.getPrettyHtml(moveMethodDiff, {
        drawFileList: true,
        matching: "lines"
      });
      popup.showDiff(button, "".concat(refactoring.type, " - ").concat(refactoring.object_type), moveMethodHTML, link);
    });
    button.innerText = "R";
    line.appendChild(button);
  });
}
},{}]},{},["content-script.js"], null)