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
})({"../node_modules/diff2html/lib-esm/types.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiffStyleType = exports.LineMatchingType = exports.OutputFormatType = exports.LineType = void 0;
var LineType;
exports.LineType = LineType;

(function (LineType) {
  LineType["INSERT"] = "insert";
  LineType["DELETE"] = "delete";
  LineType["CONTEXT"] = "context";
})(LineType || (exports.LineType = LineType = {}));

var OutputFormatType = {
  LINE_BY_LINE: 'line-by-line',
  SIDE_BY_SIDE: 'side-by-side'
};
exports.OutputFormatType = OutputFormatType;
var LineMatchingType = {
  LINES: 'lines',
  WORDS: 'words',
  NONE: 'none'
};
exports.LineMatchingType = LineMatchingType;
var DiffStyleType = {
  WORD: 'word',
  CHAR: 'char'
};
exports.DiffStyleType = DiffStyleType;
},{}],"../node_modules/diff2html/lib-esm/utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.escapeForRegExp = escapeForRegExp;
exports.unifyPath = unifyPath;
exports.hashCode = hashCode;
var specials = ['-', '[', ']', '/', '{', '}', '(', ')', '*', '+', '?', '.', '\\', '^', '$', '|'];
var regex = RegExp('[' + specials.join('\\') + ']', 'g');

function escapeForRegExp(str) {
  return str.replace(regex, '\\$&');
}

function unifyPath(path) {
  return path ? path.replace(/\\/g, '/') : path;
}

function hashCode(text) {
  var i, chr, len;
  var hash = 0;

  for (i = 0, len = text.length; i < len; i++) {
    chr = text.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }

  return hash;
}
},{}],"../node_modules/diff2html/lib-esm/diff-parser.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;

var _types = require("./types");

var _utils = require("./utils");

var __spreadArrays = void 0 && (void 0).__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) {
    s += arguments[i].length;
  }

  for (var r = Array(s), k = 0, i = 0; i < il; i++) {
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {
      r[k] = a[j];
    }
  }

  return r;
};

function getExtension(filename, language) {
  var filenameParts = filename.split('.');
  return filenameParts.length > 1 ? filenameParts[filenameParts.length - 1] : language;
}

function startsWithAny(str, prefixes) {
  return prefixes.reduce(function (startsWith, prefix) {
    return startsWith || str.startsWith(prefix);
  }, false);
}

var baseDiffFilenamePrefixes = ['a/', 'b/', 'i/', 'w/', 'c/', 'o/'];

function getFilename(line, linePrefix, extraPrefix) {
  var prefixes = extraPrefix !== undefined ? __spreadArrays(baseDiffFilenamePrefixes, [extraPrefix]) : baseDiffFilenamePrefixes;
  var FilenameRegExp = linePrefix ? new RegExp("^" + (0, _utils.escapeForRegExp)(linePrefix) + " \"?(.+?)\"?$") : new RegExp('^"?(.+?)"?$');

  var _a = FilenameRegExp.exec(line) || [],
      _b = _a[1],
      filename = _b === void 0 ? '' : _b;

  var matchingPrefix = prefixes.find(function (p) {
    return filename.indexOf(p) === 0;
  });
  var fnameWithoutPrefix = matchingPrefix ? filename.slice(matchingPrefix.length) : filename;
  return fnameWithoutPrefix.replace(/\s+\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)? [+-]\d{4}.*$/, '');
}

function getSrcFilename(line, srcPrefix) {
  return getFilename(line, '---', srcPrefix);
}

function getDstFilename(line, dstPrefix) {
  return getFilename(line, '+++', dstPrefix);
}

function parse(diffInput, config) {
  if (config === void 0) {
    config = {};
  }

  var files = [];
  var currentFile = null;
  var currentBlock = null;
  var oldLine = null;
  var oldLine2 = null;
  var newLine = null;
  var possibleOldName = null;
  var possibleNewName = null;
  var oldFileNameHeader = '--- ';
  var newFileNameHeader = '+++ ';
  var hunkHeaderPrefix = '@@';
  var oldMode = /^old mode (\d{6})/;
  var newMode = /^new mode (\d{6})/;
  var deletedFileMode = /^deleted file mode (\d{6})/;
  var newFileMode = /^new file mode (\d{6})/;
  var copyFrom = /^copy from "?(.+)"?/;
  var copyTo = /^copy to "?(.+)"?/;
  var renameFrom = /^rename from "?(.+)"?/;
  var renameTo = /^rename to "?(.+)"?/;
  var similarityIndex = /^similarity index (\d+)%/;
  var dissimilarityIndex = /^dissimilarity index (\d+)%/;
  var index = /^index ([\da-z]+)\.\.([\da-z]+)\s*(\d{6})?/;
  var binaryFiles = /^Binary files (.*) and (.*) differ/;
  var binaryDiff = /^GIT binary patch/;
  var combinedIndex = /^index ([\da-z]+),([\da-z]+)\.\.([\da-z]+)/;
  var combinedMode = /^mode (\d{6}),(\d{6})\.\.(\d{6})/;
  var combinedNewFile = /^new file mode (\d{6})/;
  var combinedDeletedFile = /^deleted file mode (\d{6}),(\d{6})/;
  var diffLines = diffInput.replace(/\\ No newline at end of file/g, '').replace(/\r\n?/g, '\n').split('\n');

  function saveBlock() {
    if (currentBlock !== null && currentFile !== null) {
      currentFile.blocks.push(currentBlock);
      currentBlock = null;
    }
  }

  function saveFile() {
    if (currentFile !== null) {
      if (!currentFile.oldName && possibleOldName !== null) {
        currentFile.oldName = possibleOldName;
      }

      if (!currentFile.newName && possibleNewName !== null) {
        currentFile.newName = possibleNewName;
      }

      if (currentFile.newName) {
        files.push(currentFile);
        currentFile = null;
      }
    }

    possibleOldName = null;
    possibleNewName = null;
  }

  function startFile() {
    saveBlock();
    saveFile();
    currentFile = {
      blocks: [],
      deletedLines: 0,
      addedLines: 0
    };
  }

  function startBlock(line) {
    saveBlock();
    var values;

    if (currentFile !== null) {
      if (values = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@.*/.exec(line)) {
        currentFile.isCombined = false;
        oldLine = parseInt(values[1], 10);
        newLine = parseInt(values[2], 10);
      } else if (values = /^@@@ -(\d+)(?:,\d+)? -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@@.*/.exec(line)) {
        currentFile.isCombined = true;
        oldLine = parseInt(values[1], 10);
        oldLine2 = parseInt(values[2], 10);
        newLine = parseInt(values[3], 10);
      } else {
        if (line.startsWith(hunkHeaderPrefix)) {
          console.error('Failed to parse lines, starting in 0!');
        }

        oldLine = 0;
        newLine = 0;
        currentFile.isCombined = false;
      }
    }

    currentBlock = {
      lines: [],
      oldStartLine: oldLine,
      oldStartLine2: oldLine2,
      newStartLine: newLine,
      header: line
    };
  }

  function createLine(line) {
    if (currentFile === null || currentBlock === null || oldLine === null || newLine === null) return;
    var currentLine = {
      content: line
    };
    var addedPrefixes = currentFile.isCombined ? ['+ ', ' +', '++'] : ['+'];
    var deletedPrefixes = currentFile.isCombined ? ['- ', ' -', '--'] : ['-'];

    if (startsWithAny(line, addedPrefixes)) {
      currentFile.addedLines++;
      currentLine.type = _types.LineType.INSERT;
      currentLine.oldNumber = undefined;
      currentLine.newNumber = newLine++;
    } else if (startsWithAny(line, deletedPrefixes)) {
      currentFile.deletedLines++;
      currentLine.type = _types.LineType.DELETE;
      currentLine.oldNumber = oldLine++;
      currentLine.newNumber = undefined;
    } else {
      currentLine.type = _types.LineType.CONTEXT;
      currentLine.oldNumber = oldLine++;
      currentLine.newNumber = newLine++;
    }

    currentBlock.lines.push(currentLine);
  }

  function existHunkHeader(line, lineIdx) {
    var idx = lineIdx;

    while (idx < diffLines.length - 3) {
      if (line.startsWith('diff')) {
        return false;
      }

      if (diffLines[idx].startsWith(oldFileNameHeader) && diffLines[idx + 1].startsWith(newFileNameHeader) && diffLines[idx + 2].startsWith(hunkHeaderPrefix)) {
        return true;
      }

      idx++;
    }

    return false;
  }

  diffLines.forEach(function (line, lineIndex) {
    if (!line || line.startsWith('*')) {
      return;
    }

    var values;
    var prevLine = diffLines[lineIndex - 1];
    var nxtLine = diffLines[lineIndex + 1];
    var afterNxtLine = diffLines[lineIndex + 2];

    if (line.startsWith('diff')) {
      startFile();
      var gitDiffStart = /^diff --git "?(.+)"? "?(.+)"?/;

      if (values = gitDiffStart.exec(line)) {
        possibleOldName = getFilename(values[1], undefined, config.dstPrefix);
        possibleNewName = getFilename(values[2], undefined, config.srcPrefix);
      }

      if (currentFile === null) {
        throw new Error('Where is my file !!!');
      }

      currentFile.isGitDiff = true;
      return;
    }

    if (!currentFile || !currentFile.isGitDiff && currentFile && line.startsWith(oldFileNameHeader) && nxtLine.startsWith(newFileNameHeader) && afterNxtLine.startsWith(hunkHeaderPrefix)) {
      startFile();
    }

    if (line.startsWith(oldFileNameHeader) && nxtLine.startsWith(newFileNameHeader) || line.startsWith(newFileNameHeader) && prevLine.startsWith(oldFileNameHeader)) {
      if (currentFile && !currentFile.oldName && line.startsWith('--- ') && (values = getSrcFilename(line, config.srcPrefix))) {
        currentFile.oldName = values;
        currentFile.language = getExtension(currentFile.oldName, currentFile.language);
        return;
      }

      if (currentFile && !currentFile.newName && line.startsWith('+++ ') && (values = getDstFilename(line, config.dstPrefix))) {
        currentFile.newName = values;
        currentFile.language = getExtension(currentFile.newName, currentFile.language);
        return;
      }
    }

    if (currentFile && (line.startsWith(hunkHeaderPrefix) || currentFile.isGitDiff && currentFile.oldName && currentFile.newName && !currentBlock)) {
      startBlock(line);
      return;
    }

    if (currentBlock && (line.startsWith('+') || line.startsWith('-') || line.startsWith(' '))) {
      createLine(line);
      return;
    }

    var doesNotExistHunkHeader = !existHunkHeader(line, lineIndex);

    if (currentFile === null) {
      throw new Error('Where is my file !!!');
    }

    if (values = oldMode.exec(line)) {
      currentFile.oldMode = values[1];
    } else if (values = newMode.exec(line)) {
      currentFile.newMode = values[1];
    } else if (values = deletedFileMode.exec(line)) {
      currentFile.deletedFileMode = values[1];
      currentFile.isDeleted = true;
    } else if (values = newFileMode.exec(line)) {
      currentFile.newFileMode = values[1];
      currentFile.isNew = true;
    } else if (values = copyFrom.exec(line)) {
      if (doesNotExistHunkHeader) {
        currentFile.oldName = values[1];
      }

      currentFile.isCopy = true;
    } else if (values = copyTo.exec(line)) {
      if (doesNotExistHunkHeader) {
        currentFile.newName = values[1];
      }

      currentFile.isCopy = true;
    } else if (values = renameFrom.exec(line)) {
      if (doesNotExistHunkHeader) {
        currentFile.oldName = values[1];
      }

      currentFile.isRename = true;
    } else if (values = renameTo.exec(line)) {
      if (doesNotExistHunkHeader) {
        currentFile.newName = values[1];
      }

      currentFile.isRename = true;
    } else if (values = binaryFiles.exec(line)) {
      currentFile.isBinary = true;
      currentFile.oldName = getFilename(values[1], undefined, config.srcPrefix);
      currentFile.newName = getFilename(values[2], undefined, config.dstPrefix);
      startBlock('Binary file');
    } else if (binaryDiff.test(line)) {
      currentFile.isBinary = true;
      startBlock(line);
    } else if (values = similarityIndex.exec(line)) {
      currentFile.unchangedPercentage = parseInt(values[1], 10);
    } else if (values = dissimilarityIndex.exec(line)) {
      currentFile.changedPercentage = parseInt(values[1], 10);
    } else if (values = index.exec(line)) {
      currentFile.checksumBefore = values[1];
      currentFile.checksumAfter = values[2];
      values[3] && (currentFile.mode = values[3]);
    } else if (values = combinedIndex.exec(line)) {
      currentFile.checksumBefore = [values[2], values[3]];
      currentFile.checksumAfter = values[1];
    } else if (values = combinedMode.exec(line)) {
      currentFile.oldMode = [values[2], values[3]];
      currentFile.newMode = values[1];
    } else if (values = combinedNewFile.exec(line)) {
      currentFile.newFileMode = values[1];
      currentFile.isNew = true;
    } else if (values = combinedDeletedFile.exec(line)) {
      currentFile.deletedFileMode = values[1];
      currentFile.isDeleted = true;
    }
  });
  saveBlock();
  saveFile();
  return files;
}
},{"./types":"../node_modules/diff2html/lib-esm/types.js","./utils":"../node_modules/diff2html/lib-esm/utils.js"}],"../node_modules/diff/dist/diff.js":[function(require,module,exports) {
var define;
var global = arguments[3];
/*!

 diff v4.0.1

Software License Agreement (BSD License)

Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>

All rights reserved.

Redistribution and use of this software in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above
  copyright notice, this list of conditions and the
  following disclaimer.

* Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the
  following disclaimer in the documentation and/or other
  materials provided with the distribution.

* Neither the name of Kevin Decker nor the names of its
  contributors may be used to endorse or promote products
  derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
@license
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (global = global || self, factory(global.Diff = {}));
})(this, function (exports) {
  'use strict';

  function Diff() {}

  Diff.prototype = {
    diff: function diff(oldString, newString) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var callback = options.callback;

      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      this.options = options;
      var self = this;

      function done(value) {
        if (callback) {
          setTimeout(function () {
            callback(undefined, value);
          }, 0);
          return true;
        } else {
          return value;
        }
      } // Allow subclasses to massage the input prior to running


      oldString = this.castInput(oldString);
      newString = this.castInput(newString);
      oldString = this.removeEmpty(this.tokenize(oldString));
      newString = this.removeEmpty(this.tokenize(newString));
      var newLen = newString.length,
          oldLen = oldString.length;
      var editLength = 1;
      var maxEditLength = newLen + oldLen;
      var bestPath = [{
        newPos: -1,
        components: []
      }]; // Seed editLength = 0, i.e. the content starts with the same values

      var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);

      if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
        // Identity per the equality and tokenizer
        return done([{
          value: this.join(newString),
          count: newString.length
        }]);
      } // Main worker method. checks all permutations of a given edit length for acceptance.


      function execEditLength() {
        for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
          var basePath = void 0;

          var addPath = bestPath[diagonalPath - 1],
              removePath = bestPath[diagonalPath + 1],
              _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;

          if (addPath) {
            // No one else is going to attempt to use this value, clear it
            bestPath[diagonalPath - 1] = undefined;
          }

          var canAdd = addPath && addPath.newPos + 1 < newLen,
              canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;

          if (!canAdd && !canRemove) {
            // If this path is a terminal then prune
            bestPath[diagonalPath] = undefined;
            continue;
          } // Select the diagonal that we want to branch from. We select the prior
          // path whose position in the new string is the farthest from the origin
          // and does not pass the bounds of the diff graph


          if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
            basePath = clonePath(removePath);
            self.pushComponent(basePath.components, undefined, true);
          } else {
            basePath = addPath; // No need to clone, we've pulled it from the list

            basePath.newPos++;
            self.pushComponent(basePath.components, true, undefined);
          }

          _oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath); // If we have hit the end of both strings, then we are done

          if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
            return done(buildValues(self, basePath.components, newString, oldString, self.useLongestToken));
          } else {
            // Otherwise track this path as a potential candidate and continue.
            bestPath[diagonalPath] = basePath;
          }
        }

        editLength++;
      } // Performs the length of edit iteration. Is a bit fugly as this has to support the
      // sync and async mode which is never fun. Loops over execEditLength until a value
      // is produced.


      if (callback) {
        (function exec() {
          setTimeout(function () {
            // This should not happen, but we want to be safe.

            /* istanbul ignore next */
            if (editLength > maxEditLength) {
              return callback();
            }

            if (!execEditLength()) {
              exec();
            }
          }, 0);
        })();
      } else {
        while (editLength <= maxEditLength) {
          var ret = execEditLength();

          if (ret) {
            return ret;
          }
        }
      }
    },
    pushComponent: function pushComponent(components, added, removed) {
      var last = components[components.length - 1];

      if (last && last.added === added && last.removed === removed) {
        // We need to clone here as the component clone operation is just
        // as shallow array clone
        components[components.length - 1] = {
          count: last.count + 1,
          added: added,
          removed: removed
        };
      } else {
        components.push({
          count: 1,
          added: added,
          removed: removed
        });
      }
    },
    extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath) {
      var newLen = newString.length,
          oldLen = oldString.length,
          newPos = basePath.newPos,
          oldPos = newPos - diagonalPath,
          commonCount = 0;

      while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
        newPos++;
        oldPos++;
        commonCount++;
      }

      if (commonCount) {
        basePath.components.push({
          count: commonCount
        });
      }

      basePath.newPos = newPos;
      return oldPos;
    },
    equals: function equals(left, right) {
      if (this.options.comparator) {
        return this.options.comparator(left, right);
      } else {
        return left === right || this.options.ignoreCase && left.toLowerCase() === right.toLowerCase();
      }
    },
    removeEmpty: function removeEmpty(array) {
      var ret = [];

      for (var i = 0; i < array.length; i++) {
        if (array[i]) {
          ret.push(array[i]);
        }
      }

      return ret;
    },
    castInput: function castInput(value) {
      return value;
    },
    tokenize: function tokenize(value) {
      return value.split('');
    },
    join: function join(chars) {
      return chars.join('');
    }
  };

  function buildValues(diff, components, newString, oldString, useLongestToken) {
    var componentPos = 0,
        componentLen = components.length,
        newPos = 0,
        oldPos = 0;

    for (; componentPos < componentLen; componentPos++) {
      var component = components[componentPos];

      if (!component.removed) {
        if (!component.added && useLongestToken) {
          var value = newString.slice(newPos, newPos + component.count);
          value = value.map(function (value, i) {
            var oldValue = oldString[oldPos + i];
            return oldValue.length > value.length ? oldValue : value;
          });
          component.value = diff.join(value);
        } else {
          component.value = diff.join(newString.slice(newPos, newPos + component.count));
        }

        newPos += component.count; // Common case

        if (!component.added) {
          oldPos += component.count;
        }
      } else {
        component.value = diff.join(oldString.slice(oldPos, oldPos + component.count));
        oldPos += component.count; // Reverse add and remove so removes are output first to match common convention
        // The diffing algorithm is tied to add then remove output and this is the simplest
        // route to get the desired output with minimal overhead.

        if (componentPos && components[componentPos - 1].added) {
          var tmp = components[componentPos - 1];
          components[componentPos - 1] = components[componentPos];
          components[componentPos] = tmp;
        }
      }
    } // Special case handle for when one terminal is ignored (i.e. whitespace).
    // For this case we merge the terminal into the prior string and drop the change.
    // This is only available for string mode.


    var lastComponent = components[componentLen - 1];

    if (componentLen > 1 && typeof lastComponent.value === 'string' && (lastComponent.added || lastComponent.removed) && diff.equals('', lastComponent.value)) {
      components[componentLen - 2].value += lastComponent.value;
      components.pop();
    }

    return components;
  }

  function clonePath(path) {
    return {
      newPos: path.newPos,
      components: path.components.slice(0)
    };
  }

  var characterDiff = new Diff();

  function diffChars(oldStr, newStr, options) {
    return characterDiff.diff(oldStr, newStr, options);
  }

  function generateOptions(options, defaults) {
    if (typeof options === 'function') {
      defaults.callback = options;
    } else if (options) {
      for (var name in options) {
        /* istanbul ignore else */
        if (options.hasOwnProperty(name)) {
          defaults[name] = options[name];
        }
      }
    }

    return defaults;
  } //
  // Ranges and exceptions:
  // Latin-1 Supplement, 0080–00FF
  //  - U+00D7  × Multiplication sign
  //  - U+00F7  ÷ Division sign
  // Latin Extended-A, 0100–017F
  // Latin Extended-B, 0180–024F
  // IPA Extensions, 0250–02AF
  // Spacing Modifier Letters, 02B0–02FF
  //  - U+02C7  ˇ &#711;  Caron
  //  - U+02D8  ˘ &#728;  Breve
  //  - U+02D9  ˙ &#729;  Dot Above
  //  - U+02DA  ˚ &#730;  Ring Above
  //  - U+02DB  ˛ &#731;  Ogonek
  //  - U+02DC  ˜ &#732;  Small Tilde
  //  - U+02DD  ˝ &#733;  Double Acute Accent
  // Latin Extended Additional, 1E00–1EFF


  var extendedWordChars = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/;
  var reWhitespace = /\S/;
  var wordDiff = new Diff();

  wordDiff.equals = function (left, right) {
    if (this.options.ignoreCase) {
      left = left.toLowerCase();
      right = right.toLowerCase();
    }

    return left === right || this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right);
  };

  wordDiff.tokenize = function (value) {
    var tokens = value.split(/(\s+|[()[\]{}'"]|\b)/); // Join the boundary splits that we do not consider to be boundaries. This is primarily the extended Latin character set.

    for (var i = 0; i < tokens.length - 1; i++) {
      // If we have an empty string in the next field and we have only word chars before and after, merge
      if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
        tokens[i] += tokens[i + 2];
        tokens.splice(i + 1, 2);
        i--;
      }
    }

    return tokens;
  };

  function diffWords(oldStr, newStr, options) {
    options = generateOptions(options, {
      ignoreWhitespace: true
    });
    return wordDiff.diff(oldStr, newStr, options);
  }

  function diffWordsWithSpace(oldStr, newStr, options) {
    return wordDiff.diff(oldStr, newStr, options);
  }

  var lineDiff = new Diff();

  lineDiff.tokenize = function (value) {
    var retLines = [],
        linesAndNewlines = value.split(/(\n|\r\n)/); // Ignore the final empty token that occurs if the string ends with a new line

    if (!linesAndNewlines[linesAndNewlines.length - 1]) {
      linesAndNewlines.pop();
    } // Merge the content and line separators into single tokens


    for (var i = 0; i < linesAndNewlines.length; i++) {
      var line = linesAndNewlines[i];

      if (i % 2 && !this.options.newlineIsToken) {
        retLines[retLines.length - 1] += line;
      } else {
        if (this.options.ignoreWhitespace) {
          line = line.trim();
        }

        retLines.push(line);
      }
    }

    return retLines;
  };

  function diffLines(oldStr, newStr, callback) {
    return lineDiff.diff(oldStr, newStr, callback);
  }

  function diffTrimmedLines(oldStr, newStr, callback) {
    var options = generateOptions(callback, {
      ignoreWhitespace: true
    });
    return lineDiff.diff(oldStr, newStr, options);
  }

  var sentenceDiff = new Diff();

  sentenceDiff.tokenize = function (value) {
    return value.split(/(\S.+?[.!?])(?=\s+|$)/);
  };

  function diffSentences(oldStr, newStr, callback) {
    return sentenceDiff.diff(oldStr, newStr, callback);
  }

  var cssDiff = new Diff();

  cssDiff.tokenize = function (value) {
    return value.split(/([{}:;,]|\s+)/);
  };

  function diffCss(oldStr, newStr, callback) {
    return cssDiff.diff(oldStr, newStr, callback);
  }

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var objectPrototypeToString = Object.prototype.toString;
  var jsonDiff = new Diff(); // Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
  // dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:

  jsonDiff.useLongestToken = true;
  jsonDiff.tokenize = lineDiff.tokenize;

  jsonDiff.castInput = function (value) {
    var _this$options = this.options,
        undefinedReplacement = _this$options.undefinedReplacement,
        _this$options$stringi = _this$options.stringifyReplacer,
        stringifyReplacer = _this$options$stringi === void 0 ? function (k, v) {
      return typeof v === 'undefined' ? undefinedReplacement : v;
    } : _this$options$stringi;
    return typeof value === 'string' ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), stringifyReplacer, '  ');
  };

  jsonDiff.equals = function (left, right) {
    return Diff.prototype.equals.call(jsonDiff, left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'));
  };

  function diffJson(oldObj, newObj, options) {
    return jsonDiff.diff(oldObj, newObj, options);
  } // This function handles the presence of circular references by bailing out when encountering an
  // object that is already on the "stack" of items being processed. Accepts an optional replacer


  function canonicalize(obj, stack, replacementStack, replacer, key) {
    stack = stack || [];
    replacementStack = replacementStack || [];

    if (replacer) {
      obj = replacer(key, obj);
    }

    var i;

    for (i = 0; i < stack.length; i += 1) {
      if (stack[i] === obj) {
        return replacementStack[i];
      }
    }

    var canonicalizedObj;

    if ('[object Array]' === objectPrototypeToString.call(obj)) {
      stack.push(obj);
      canonicalizedObj = new Array(obj.length);
      replacementStack.push(canonicalizedObj);

      for (i = 0; i < obj.length; i += 1) {
        canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, key);
      }

      stack.pop();
      replacementStack.pop();
      return canonicalizedObj;
    }

    if (obj && obj.toJSON) {
      obj = obj.toJSON();
    }

    if (_typeof(obj) === 'object' && obj !== null) {
      stack.push(obj);
      canonicalizedObj = {};
      replacementStack.push(canonicalizedObj);

      var sortedKeys = [],
          _key;

      for (_key in obj) {
        /* istanbul ignore else */
        if (obj.hasOwnProperty(_key)) {
          sortedKeys.push(_key);
        }
      }

      sortedKeys.sort();

      for (i = 0; i < sortedKeys.length; i += 1) {
        _key = sortedKeys[i];
        canonicalizedObj[_key] = canonicalize(obj[_key], stack, replacementStack, replacer, _key);
      }

      stack.pop();
      replacementStack.pop();
    } else {
      canonicalizedObj = obj;
    }

    return canonicalizedObj;
  }

  var arrayDiff = new Diff();

  arrayDiff.tokenize = function (value) {
    return value.slice();
  };

  arrayDiff.join = arrayDiff.removeEmpty = function (value) {
    return value;
  };

  function diffArrays(oldArr, newArr, callback) {
    return arrayDiff.diff(oldArr, newArr, callback);
  }

  function parsePatch(uniDiff) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var diffstr = uniDiff.split(/\r\n|[\n\v\f\r\x85]/),
        delimiters = uniDiff.match(/\r\n|[\n\v\f\r\x85]/g) || [],
        list = [],
        i = 0;

    function parseIndex() {
      var index = {};
      list.push(index); // Parse diff metadata

      while (i < diffstr.length) {
        var line = diffstr[i]; // File header found, end parsing diff metadata

        if (/^(\-\-\-|\+\+\+|@@)\s/.test(line)) {
          break;
        } // Diff index


        var header = /^(?:Index:|diff(?: -r \w+)+)\s+(.+?)\s*$/.exec(line);

        if (header) {
          index.index = header[1];
        }

        i++;
      } // Parse file headers if they are defined. Unified diff requires them, but
      // there's no technical issues to have an isolated hunk without file header


      parseFileHeader(index);
      parseFileHeader(index); // Parse hunks

      index.hunks = [];

      while (i < diffstr.length) {
        var _line = diffstr[i];

        if (/^(Index:|diff|\-\-\-|\+\+\+)\s/.test(_line)) {
          break;
        } else if (/^@@/.test(_line)) {
          index.hunks.push(parseHunk());
        } else if (_line && options.strict) {
          // Ignore unexpected content unless in strict mode
          throw new Error('Unknown line ' + (i + 1) + ' ' + JSON.stringify(_line));
        } else {
          i++;
        }
      }
    } // Parses the --- and +++ headers, if none are found, no lines
    // are consumed.


    function parseFileHeader(index) {
      var fileHeader = /^(---|\+\+\+)\s+(.*)$/.exec(diffstr[i]);

      if (fileHeader) {
        var keyPrefix = fileHeader[1] === '---' ? 'old' : 'new';
        var data = fileHeader[2].split('\t', 2);
        var fileName = data[0].replace(/\\\\/g, '\\');

        if (/^".*"$/.test(fileName)) {
          fileName = fileName.substr(1, fileName.length - 2);
        }

        index[keyPrefix + 'FileName'] = fileName;
        index[keyPrefix + 'Header'] = (data[1] || '').trim();
        i++;
      }
    } // Parses a hunk
    // This assumes that we are at the start of a hunk.


    function parseHunk() {
      var chunkHeaderIndex = i,
          chunkHeaderLine = diffstr[i++],
          chunkHeader = chunkHeaderLine.split(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      var hunk = {
        oldStart: +chunkHeader[1],
        oldLines: +chunkHeader[2] || 1,
        newStart: +chunkHeader[3],
        newLines: +chunkHeader[4] || 1,
        lines: [],
        linedelimiters: []
      };
      var addCount = 0,
          removeCount = 0;

      for (; i < diffstr.length; i++) {
        // Lines starting with '---' could be mistaken for the "remove line" operation
        // But they could be the header for the next file. Therefore prune such cases out.
        if (diffstr[i].indexOf('--- ') === 0 && i + 2 < diffstr.length && diffstr[i + 1].indexOf('+++ ') === 0 && diffstr[i + 2].indexOf('@@') === 0) {
          break;
        }

        var operation = diffstr[i].length == 0 && i != diffstr.length - 1 ? ' ' : diffstr[i][0];

        if (operation === '+' || operation === '-' || operation === ' ' || operation === '\\') {
          hunk.lines.push(diffstr[i]);
          hunk.linedelimiters.push(delimiters[i] || '\n');

          if (operation === '+') {
            addCount++;
          } else if (operation === '-') {
            removeCount++;
          } else if (operation === ' ') {
            addCount++;
            removeCount++;
          }
        } else {
          break;
        }
      } // Handle the empty block count case


      if (!addCount && hunk.newLines === 1) {
        hunk.newLines = 0;
      }

      if (!removeCount && hunk.oldLines === 1) {
        hunk.oldLines = 0;
      } // Perform optional sanity checking


      if (options.strict) {
        if (addCount !== hunk.newLines) {
          throw new Error('Added line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
        }

        if (removeCount !== hunk.oldLines) {
          throw new Error('Removed line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
        }
      }

      return hunk;
    }

    while (i < diffstr.length) {
      parseIndex();
    }

    return list;
  } // Iterator that traverses in the range of [min, max], stepping
  // by distance from a given start position. I.e. for [0, 4], with
  // start of 2, this will iterate 2, 3, 1, 4, 0.


  function distanceIterator(start, minLine, maxLine) {
    var wantForward = true,
        backwardExhausted = false,
        forwardExhausted = false,
        localOffset = 1;
    return function iterator() {
      if (wantForward && !forwardExhausted) {
        if (backwardExhausted) {
          localOffset++;
        } else {
          wantForward = false;
        } // Check if trying to fit beyond text length, and if not, check it fits
        // after offset location (or desired location on first iteration)


        if (start + localOffset <= maxLine) {
          return localOffset;
        }

        forwardExhausted = true;
      }

      if (!backwardExhausted) {
        if (!forwardExhausted) {
          wantForward = true;
        } // Check if trying to fit before text beginning, and if not, check it fits
        // before offset location


        if (minLine <= start - localOffset) {
          return -localOffset++;
        }

        backwardExhausted = true;
        return iterator();
      } // We tried to fit hunk before text beginning and beyond text length, then
      // hunk can't fit on the text. Return undefined

    };
  }

  function applyPatch(source, uniDiff) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (typeof uniDiff === 'string') {
      uniDiff = parsePatch(uniDiff);
    }

    if (Array.isArray(uniDiff)) {
      if (uniDiff.length > 1) {
        throw new Error('applyPatch only works with a single input.');
      }

      uniDiff = uniDiff[0];
    } // Apply the diff to the input


    var lines = source.split(/\r\n|[\n\v\f\r\x85]/),
        delimiters = source.match(/\r\n|[\n\v\f\r\x85]/g) || [],
        hunks = uniDiff.hunks,
        compareLine = options.compareLine || function (lineNumber, line, operation, patchContent) {
      return line === patchContent;
    },
        errorCount = 0,
        fuzzFactor = options.fuzzFactor || 0,
        minLine = 0,
        offset = 0,
        removeEOFNL,
        addEOFNL;
    /**
     * Checks if the hunk exactly fits on the provided location
     */


    function hunkFits(hunk, toPos) {
      for (var j = 0; j < hunk.lines.length; j++) {
        var line = hunk.lines[j],
            operation = line.length > 0 ? line[0] : ' ',
            content = line.length > 0 ? line.substr(1) : line;

        if (operation === ' ' || operation === '-') {
          // Context sanity check
          if (!compareLine(toPos + 1, lines[toPos], operation, content)) {
            errorCount++;

            if (errorCount > fuzzFactor) {
              return false;
            }
          }

          toPos++;
        }
      }

      return true;
    } // Search best fit offsets for each hunk based on the previous ones


    for (var i = 0; i < hunks.length; i++) {
      var hunk = hunks[i],
          maxLine = lines.length - hunk.oldLines,
          localOffset = 0,
          toPos = offset + hunk.oldStart - 1;
      var iterator = distanceIterator(toPos, minLine, maxLine);

      for (; localOffset !== undefined; localOffset = iterator()) {
        if (hunkFits(hunk, toPos + localOffset)) {
          hunk.offset = offset += localOffset;
          break;
        }
      }

      if (localOffset === undefined) {
        return false;
      } // Set lower text limit to end of the current hunk, so next ones don't try
      // to fit over already patched text


      minLine = hunk.offset + hunk.oldStart + hunk.oldLines;
    } // Apply patch hunks


    var diffOffset = 0;

    for (var _i = 0; _i < hunks.length; _i++) {
      var _hunk = hunks[_i],
          _toPos = _hunk.oldStart + _hunk.offset + diffOffset - 1;

      diffOffset += _hunk.newLines - _hunk.oldLines;

      if (_toPos < 0) {
        // Creating a new file
        _toPos = 0;
      }

      for (var j = 0; j < _hunk.lines.length; j++) {
        var line = _hunk.lines[j],
            operation = line.length > 0 ? line[0] : ' ',
            content = line.length > 0 ? line.substr(1) : line,
            delimiter = _hunk.linedelimiters[j];

        if (operation === ' ') {
          _toPos++;
        } else if (operation === '-') {
          lines.splice(_toPos, 1);
          delimiters.splice(_toPos, 1);
          /* istanbul ignore else */
        } else if (operation === '+') {
          lines.splice(_toPos, 0, content);
          delimiters.splice(_toPos, 0, delimiter);
          _toPos++;
        } else if (operation === '\\') {
          var previousOperation = _hunk.lines[j - 1] ? _hunk.lines[j - 1][0] : null;

          if (previousOperation === '+') {
            removeEOFNL = true;
          } else if (previousOperation === '-') {
            addEOFNL = true;
          }
        }
      }
    } // Handle EOFNL insertion/removal


    if (removeEOFNL) {
      while (!lines[lines.length - 1]) {
        lines.pop();
        delimiters.pop();
      }
    } else if (addEOFNL) {
      lines.push('');
      delimiters.push('\n');
    }

    for (var _k = 0; _k < lines.length - 1; _k++) {
      lines[_k] = lines[_k] + delimiters[_k];
    }

    return lines.join('');
  } // Wrapper that supports multiple file patches via callbacks.


  function applyPatches(uniDiff, options) {
    if (typeof uniDiff === 'string') {
      uniDiff = parsePatch(uniDiff);
    }

    var currentIndex = 0;

    function processIndex() {
      var index = uniDiff[currentIndex++];

      if (!index) {
        return options.complete();
      }

      options.loadFile(index, function (err, data) {
        if (err) {
          return options.complete(err);
        }

        var updatedContent = applyPatch(data, index, options);
        options.patched(index, updatedContent, function (err) {
          if (err) {
            return options.complete(err);
          }

          processIndex();
        });
      });
    }

    processIndex();
  }

  function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
    if (!options) {
      options = {};
    }

    if (typeof options.context === 'undefined') {
      options.context = 4;
    }

    var diff = diffLines(oldStr, newStr, options);
    diff.push({
      value: '',
      lines: []
    }); // Append an empty value to make cleanup easier

    function contextLines(lines) {
      return lines.map(function (entry) {
        return ' ' + entry;
      });
    }

    var hunks = [];
    var oldRangeStart = 0,
        newRangeStart = 0,
        curRange = [],
        oldLine = 1,
        newLine = 1;

    var _loop = function _loop(i) {
      var current = diff[i],
          lines = current.lines || current.value.replace(/\n$/, '').split('\n');
      current.lines = lines;

      if (current.added || current.removed) {
        var _curRange; // If we have previous context, start with that


        if (!oldRangeStart) {
          var prev = diff[i - 1];
          oldRangeStart = oldLine;
          newRangeStart = newLine;

          if (prev) {
            curRange = options.context > 0 ? contextLines(prev.lines.slice(-options.context)) : [];
            oldRangeStart -= curRange.length;
            newRangeStart -= curRange.length;
          }
        } // Output our changes


        (_curRange = curRange).push.apply(_curRange, _toConsumableArray(lines.map(function (entry) {
          return (current.added ? '+' : '-') + entry;
        }))); // Track the updated file position


        if (current.added) {
          newLine += lines.length;
        } else {
          oldLine += lines.length;
        }
      } else {
        // Identical context lines. Track line changes
        if (oldRangeStart) {
          // Close out any changes that have been output (or join overlapping)
          if (lines.length <= options.context * 2 && i < diff.length - 2) {
            var _curRange2; // Overlapping


            (_curRange2 = curRange).push.apply(_curRange2, _toConsumableArray(contextLines(lines)));
          } else {
            var _curRange3; // end the range and output


            var contextSize = Math.min(lines.length, options.context);

            (_curRange3 = curRange).push.apply(_curRange3, _toConsumableArray(contextLines(lines.slice(0, contextSize))));

            var hunk = {
              oldStart: oldRangeStart,
              oldLines: oldLine - oldRangeStart + contextSize,
              newStart: newRangeStart,
              newLines: newLine - newRangeStart + contextSize,
              lines: curRange
            };

            if (i >= diff.length - 2 && lines.length <= options.context) {
              // EOF is inside this hunk
              var oldEOFNewline = /\n$/.test(oldStr);
              var newEOFNewline = /\n$/.test(newStr);
              var noNlBeforeAdds = lines.length == 0 && curRange.length > hunk.oldLines;

              if (!oldEOFNewline && noNlBeforeAdds) {
                // special case: old has no eol and no trailing context; no-nl can end up before adds
                curRange.splice(hunk.oldLines, 0, '\\ No newline at end of file');
              }

              if (!oldEOFNewline && !noNlBeforeAdds || !newEOFNewline) {
                curRange.push('\\ No newline at end of file');
              }
            }

            hunks.push(hunk);
            oldRangeStart = 0;
            newRangeStart = 0;
            curRange = [];
          }
        }

        oldLine += lines.length;
        newLine += lines.length;
      }
    };

    for (var i = 0; i < diff.length; i++) {
      _loop(i);
    }

    return {
      oldFileName: oldFileName,
      newFileName: newFileName,
      oldHeader: oldHeader,
      newHeader: newHeader,
      hunks: hunks
    };
  }

  function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
    var diff = structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options);
    var ret = [];

    if (oldFileName == newFileName) {
      ret.push('Index: ' + oldFileName);
    }

    ret.push('===================================================================');
    ret.push('--- ' + diff.oldFileName + (typeof diff.oldHeader === 'undefined' ? '' : '\t' + diff.oldHeader));
    ret.push('+++ ' + diff.newFileName + (typeof diff.newHeader === 'undefined' ? '' : '\t' + diff.newHeader));

    for (var i = 0; i < diff.hunks.length; i++) {
      var hunk = diff.hunks[i];
      ret.push('@@ -' + hunk.oldStart + ',' + hunk.oldLines + ' +' + hunk.newStart + ',' + hunk.newLines + ' @@');
      ret.push.apply(ret, hunk.lines);
    }

    return ret.join('\n') + '\n';
  }

  function createPatch(fileName, oldStr, newStr, oldHeader, newHeader, options) {
    return createTwoFilesPatch(fileName, fileName, oldStr, newStr, oldHeader, newHeader, options);
  }

  function arrayEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    return arrayStartsWith(a, b);
  }

  function arrayStartsWith(array, start) {
    if (start.length > array.length) {
      return false;
    }

    for (var i = 0; i < start.length; i++) {
      if (start[i] !== array[i]) {
        return false;
      }
    }

    return true;
  }

  function calcLineCount(hunk) {
    var _calcOldNewLineCount = calcOldNewLineCount(hunk.lines),
        oldLines = _calcOldNewLineCount.oldLines,
        newLines = _calcOldNewLineCount.newLines;

    if (oldLines !== undefined) {
      hunk.oldLines = oldLines;
    } else {
      delete hunk.oldLines;
    }

    if (newLines !== undefined) {
      hunk.newLines = newLines;
    } else {
      delete hunk.newLines;
    }
  }

  function merge(mine, theirs, base) {
    mine = loadPatch(mine, base);
    theirs = loadPatch(theirs, base);
    var ret = {}; // For index we just let it pass through as it doesn't have any necessary meaning.
    // Leaving sanity checks on this to the API consumer that may know more about the
    // meaning in their own context.

    if (mine.index || theirs.index) {
      ret.index = mine.index || theirs.index;
    }

    if (mine.newFileName || theirs.newFileName) {
      if (!fileNameChanged(mine)) {
        // No header or no change in ours, use theirs (and ours if theirs does not exist)
        ret.oldFileName = theirs.oldFileName || mine.oldFileName;
        ret.newFileName = theirs.newFileName || mine.newFileName;
        ret.oldHeader = theirs.oldHeader || mine.oldHeader;
        ret.newHeader = theirs.newHeader || mine.newHeader;
      } else if (!fileNameChanged(theirs)) {
        // No header or no change in theirs, use ours
        ret.oldFileName = mine.oldFileName;
        ret.newFileName = mine.newFileName;
        ret.oldHeader = mine.oldHeader;
        ret.newHeader = mine.newHeader;
      } else {
        // Both changed... figure it out
        ret.oldFileName = selectField(ret, mine.oldFileName, theirs.oldFileName);
        ret.newFileName = selectField(ret, mine.newFileName, theirs.newFileName);
        ret.oldHeader = selectField(ret, mine.oldHeader, theirs.oldHeader);
        ret.newHeader = selectField(ret, mine.newHeader, theirs.newHeader);
      }
    }

    ret.hunks = [];
    var mineIndex = 0,
        theirsIndex = 0,
        mineOffset = 0,
        theirsOffset = 0;

    while (mineIndex < mine.hunks.length || theirsIndex < theirs.hunks.length) {
      var mineCurrent = mine.hunks[mineIndex] || {
        oldStart: Infinity
      },
          theirsCurrent = theirs.hunks[theirsIndex] || {
        oldStart: Infinity
      };

      if (hunkBefore(mineCurrent, theirsCurrent)) {
        // This patch does not overlap with any of the others, yay.
        ret.hunks.push(cloneHunk(mineCurrent, mineOffset));
        mineIndex++;
        theirsOffset += mineCurrent.newLines - mineCurrent.oldLines;
      } else if (hunkBefore(theirsCurrent, mineCurrent)) {
        // This patch does not overlap with any of the others, yay.
        ret.hunks.push(cloneHunk(theirsCurrent, theirsOffset));
        theirsIndex++;
        mineOffset += theirsCurrent.newLines - theirsCurrent.oldLines;
      } else {
        // Overlap, merge as best we can
        var mergedHunk = {
          oldStart: Math.min(mineCurrent.oldStart, theirsCurrent.oldStart),
          oldLines: 0,
          newStart: Math.min(mineCurrent.newStart + mineOffset, theirsCurrent.oldStart + theirsOffset),
          newLines: 0,
          lines: []
        };
        mergeLines(mergedHunk, mineCurrent.oldStart, mineCurrent.lines, theirsCurrent.oldStart, theirsCurrent.lines);
        theirsIndex++;
        mineIndex++;
        ret.hunks.push(mergedHunk);
      }
    }

    return ret;
  }

  function loadPatch(param, base) {
    if (typeof param === 'string') {
      if (/^@@/m.test(param) || /^Index:/m.test(param)) {
        return parsePatch(param)[0];
      }

      if (!base) {
        throw new Error('Must provide a base reference or pass in a patch');
      }

      return structuredPatch(undefined, undefined, base, param);
    }

    return param;
  }

  function fileNameChanged(patch) {
    return patch.newFileName && patch.newFileName !== patch.oldFileName;
  }

  function selectField(index, mine, theirs) {
    if (mine === theirs) {
      return mine;
    } else {
      index.conflict = true;
      return {
        mine: mine,
        theirs: theirs
      };
    }
  }

  function hunkBefore(test, check) {
    return test.oldStart < check.oldStart && test.oldStart + test.oldLines < check.oldStart;
  }

  function cloneHunk(hunk, offset) {
    return {
      oldStart: hunk.oldStart,
      oldLines: hunk.oldLines,
      newStart: hunk.newStart + offset,
      newLines: hunk.newLines,
      lines: hunk.lines
    };
  }

  function mergeLines(hunk, mineOffset, mineLines, theirOffset, theirLines) {
    // This will generally result in a conflicted hunk, but there are cases where the context
    // is the only overlap where we can successfully merge the content here.
    var mine = {
      offset: mineOffset,
      lines: mineLines,
      index: 0
    },
        their = {
      offset: theirOffset,
      lines: theirLines,
      index: 0
    }; // Handle any leading content

    insertLeading(hunk, mine, their);
    insertLeading(hunk, their, mine); // Now in the overlap content. Scan through and select the best changes from each.

    while (mine.index < mine.lines.length && their.index < their.lines.length) {
      var mineCurrent = mine.lines[mine.index],
          theirCurrent = their.lines[their.index];

      if ((mineCurrent[0] === '-' || mineCurrent[0] === '+') && (theirCurrent[0] === '-' || theirCurrent[0] === '+')) {
        // Both modified ...
        mutualChange(hunk, mine, their);
      } else if (mineCurrent[0] === '+' && theirCurrent[0] === ' ') {
        var _hunk$lines; // Mine inserted


        (_hunk$lines = hunk.lines).push.apply(_hunk$lines, _toConsumableArray(collectChange(mine)));
      } else if (theirCurrent[0] === '+' && mineCurrent[0] === ' ') {
        var _hunk$lines2; // Theirs inserted


        (_hunk$lines2 = hunk.lines).push.apply(_hunk$lines2, _toConsumableArray(collectChange(their)));
      } else if (mineCurrent[0] === '-' && theirCurrent[0] === ' ') {
        // Mine removed or edited
        removal(hunk, mine, their);
      } else if (theirCurrent[0] === '-' && mineCurrent[0] === ' ') {
        // Their removed or edited
        removal(hunk, their, mine, true);
      } else if (mineCurrent === theirCurrent) {
        // Context identity
        hunk.lines.push(mineCurrent);
        mine.index++;
        their.index++;
      } else {
        // Context mismatch
        conflict(hunk, collectChange(mine), collectChange(their));
      }
    } // Now push anything that may be remaining


    insertTrailing(hunk, mine);
    insertTrailing(hunk, their);
    calcLineCount(hunk);
  }

  function mutualChange(hunk, mine, their) {
    var myChanges = collectChange(mine),
        theirChanges = collectChange(their);

    if (allRemoves(myChanges) && allRemoves(theirChanges)) {
      // Special case for remove changes that are supersets of one another
      if (arrayStartsWith(myChanges, theirChanges) && skipRemoveSuperset(their, myChanges, myChanges.length - theirChanges.length)) {
        var _hunk$lines3;

        (_hunk$lines3 = hunk.lines).push.apply(_hunk$lines3, _toConsumableArray(myChanges));

        return;
      } else if (arrayStartsWith(theirChanges, myChanges) && skipRemoveSuperset(mine, theirChanges, theirChanges.length - myChanges.length)) {
        var _hunk$lines4;

        (_hunk$lines4 = hunk.lines).push.apply(_hunk$lines4, _toConsumableArray(theirChanges));

        return;
      }
    } else if (arrayEqual(myChanges, theirChanges)) {
      var _hunk$lines5;

      (_hunk$lines5 = hunk.lines).push.apply(_hunk$lines5, _toConsumableArray(myChanges));

      return;
    }

    conflict(hunk, myChanges, theirChanges);
  }

  function removal(hunk, mine, their, swap) {
    var myChanges = collectChange(mine),
        theirChanges = collectContext(their, myChanges);

    if (theirChanges.merged) {
      var _hunk$lines6;

      (_hunk$lines6 = hunk.lines).push.apply(_hunk$lines6, _toConsumableArray(theirChanges.merged));
    } else {
      conflict(hunk, swap ? theirChanges : myChanges, swap ? myChanges : theirChanges);
    }
  }

  function conflict(hunk, mine, their) {
    hunk.conflict = true;
    hunk.lines.push({
      conflict: true,
      mine: mine,
      theirs: their
    });
  }

  function insertLeading(hunk, insert, their) {
    while (insert.offset < their.offset && insert.index < insert.lines.length) {
      var line = insert.lines[insert.index++];
      hunk.lines.push(line);
      insert.offset++;
    }
  }

  function insertTrailing(hunk, insert) {
    while (insert.index < insert.lines.length) {
      var line = insert.lines[insert.index++];
      hunk.lines.push(line);
    }
  }

  function collectChange(state) {
    var ret = [],
        operation = state.lines[state.index][0];

    while (state.index < state.lines.length) {
      var line = state.lines[state.index]; // Group additions that are immediately after subtractions and treat them as one "atomic" modify change.

      if (operation === '-' && line[0] === '+') {
        operation = '+';
      }

      if (operation === line[0]) {
        ret.push(line);
        state.index++;
      } else {
        break;
      }
    }

    return ret;
  }

  function collectContext(state, matchChanges) {
    var changes = [],
        merged = [],
        matchIndex = 0,
        contextChanges = false,
        conflicted = false;

    while (matchIndex < matchChanges.length && state.index < state.lines.length) {
      var change = state.lines[state.index],
          match = matchChanges[matchIndex]; // Once we've hit our add, then we are done

      if (match[0] === '+') {
        break;
      }

      contextChanges = contextChanges || change[0] !== ' ';
      merged.push(match);
      matchIndex++; // Consume any additions in the other block as a conflict to attempt
      // to pull in the remaining context after this

      if (change[0] === '+') {
        conflicted = true;

        while (change[0] === '+') {
          changes.push(change);
          change = state.lines[++state.index];
        }
      }

      if (match.substr(1) === change.substr(1)) {
        changes.push(change);
        state.index++;
      } else {
        conflicted = true;
      }
    }

    if ((matchChanges[matchIndex] || '')[0] === '+' && contextChanges) {
      conflicted = true;
    }

    if (conflicted) {
      return changes;
    }

    while (matchIndex < matchChanges.length) {
      merged.push(matchChanges[matchIndex++]);
    }

    return {
      merged: merged,
      changes: changes
    };
  }

  function allRemoves(changes) {
    return changes.reduce(function (prev, change) {
      return prev && change[0] === '-';
    }, true);
  }

  function skipRemoveSuperset(state, removeChanges, delta) {
    for (var i = 0; i < delta; i++) {
      var changeContent = removeChanges[removeChanges.length - delta + i].substr(1);

      if (state.lines[state.index + i] !== ' ' + changeContent) {
        return false;
      }
    }

    state.index += delta;
    return true;
  }

  function calcOldNewLineCount(lines) {
    var oldLines = 0;
    var newLines = 0;
    lines.forEach(function (line) {
      if (typeof line !== 'string') {
        var myCount = calcOldNewLineCount(line.mine);
        var theirCount = calcOldNewLineCount(line.theirs);

        if (oldLines !== undefined) {
          if (myCount.oldLines === theirCount.oldLines) {
            oldLines += myCount.oldLines;
          } else {
            oldLines = undefined;
          }
        }

        if (newLines !== undefined) {
          if (myCount.newLines === theirCount.newLines) {
            newLines += myCount.newLines;
          } else {
            newLines = undefined;
          }
        }
      } else {
        if (newLines !== undefined && (line[0] === '+' || line[0] === ' ')) {
          newLines++;
        }

        if (oldLines !== undefined && (line[0] === '-' || line[0] === ' ')) {
          oldLines++;
        }
      }
    });
    return {
      oldLines: oldLines,
      newLines: newLines
    };
  } // See: http://code.google.com/p/google-diff-match-patch/wiki/API


  function convertChangesToDMP(changes) {
    var ret = [],
        change,
        operation;

    for (var i = 0; i < changes.length; i++) {
      change = changes[i];

      if (change.added) {
        operation = 1;
      } else if (change.removed) {
        operation = -1;
      } else {
        operation = 0;
      }

      ret.push([operation, change.value]);
    }

    return ret;
  }

  function convertChangesToXML(changes) {
    var ret = [];

    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];

      if (change.added) {
        ret.push('<ins>');
      } else if (change.removed) {
        ret.push('<del>');
      }

      ret.push(escapeHTML(change.value));

      if (change.added) {
        ret.push('</ins>');
      } else if (change.removed) {
        ret.push('</del>');
      }
    }

    return ret.join('');
  }

  function escapeHTML(s) {
    var n = s;
    n = n.replace(/&/g, '&amp;');
    n = n.replace(/</g, '&lt;');
    n = n.replace(/>/g, '&gt;');
    n = n.replace(/"/g, '&quot;');
    return n;
  }
  /* See LICENSE file for terms of use */


  exports.Diff = Diff;
  exports.diffChars = diffChars;
  exports.diffWords = diffWords;
  exports.diffWordsWithSpace = diffWordsWithSpace;
  exports.diffLines = diffLines;
  exports.diffTrimmedLines = diffTrimmedLines;
  exports.diffSentences = diffSentences;
  exports.diffCss = diffCss;
  exports.diffJson = diffJson;
  exports.diffArrays = diffArrays;
  exports.structuredPatch = structuredPatch;
  exports.createTwoFilesPatch = createTwoFilesPatch;
  exports.createPatch = createPatch;
  exports.applyPatch = applyPatch;
  exports.applyPatches = applyPatches;
  exports.parsePatch = parsePatch;
  exports.merge = merge;
  exports.convertChangesToDMP = convertChangesToDMP;
  exports.convertChangesToXML = convertChangesToXML;
  exports.canonicalize = canonicalize;
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
});
},{}],"../node_modules/diff2html/lib-esm/rematch.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.levenshtein = levenshtein;
exports.newDistanceFn = newDistanceFn;
exports.newMatcherFn = newMatcherFn;

function levenshtein(a, b) {
  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  var matrix = [];
  var i;

  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  var j;

  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
      }
    }
  }

  return matrix[b.length][a.length];
}

function newDistanceFn(str) {
  return function (x, y) {
    var xValue = str(x).trim();
    var yValue = str(y).trim();
    var lev = levenshtein(xValue, yValue);
    return lev / (xValue.length + yValue.length);
  };
}

function newMatcherFn(distance) {
  function findBestMatch(a, b, cache) {
    if (cache === void 0) {
      cache = new Map();
    }

    var bestMatchDist = Infinity;
    var bestMatch;

    for (var i = 0; i < a.length; ++i) {
      for (var j = 0; j < b.length; ++j) {
        var cacheKey = JSON.stringify([a[i], b[j]]);
        var md = void 0;

        if (!(cache.has(cacheKey) && (md = cache.get(cacheKey)))) {
          md = distance(a[i], b[j]);
          cache.set(cacheKey, md);
        }

        if (md < bestMatchDist) {
          bestMatchDist = md;
          bestMatch = {
            indexA: i,
            indexB: j,
            score: bestMatchDist
          };
        }
      }
    }

    return bestMatch;
  }

  function group(a, b, level, cache) {
    if (level === void 0) {
      level = 0;
    }

    if (cache === void 0) {
      cache = new Map();
    }

    var bm = findBestMatch(a, b, cache);

    if (!bm || a.length + b.length < 3) {
      return [[a, b]];
    }

    var a1 = a.slice(0, bm.indexA);
    var b1 = b.slice(0, bm.indexB);
    var aMatch = [a[bm.indexA]];
    var bMatch = [b[bm.indexB]];
    var tailA = bm.indexA + 1;
    var tailB = bm.indexB + 1;
    var a2 = a.slice(tailA);
    var b2 = b.slice(tailB);
    var group1 = group(a1, b1, level + 1, cache);
    var groupMatch = group(aMatch, bMatch, level + 1, cache);
    var group2 = group(a2, b2, level + 1, cache);
    var result = groupMatch;

    if (bm.indexA > 0 || bm.indexB > 0) {
      result = group1.concat(result);
    }

    if (a.length > tailA || b.length > tailB) {
      result = result.concat(group2);
    }

    return result;
  }

  return group;
}
},{}],"../node_modules/diff2html/lib-esm/render-utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toCSSClass = toCSSClass;
exports.escapeForHtml = escapeForHtml;
exports.deconstructLine = deconstructLine;
exports.filenameDiff = filenameDiff;
exports.getHtmlId = getHtmlId;
exports.getFileIcon = getFileIcon;
exports.diffHighlight = diffHighlight;
exports.defaultRenderConfig = exports.CSSLineClass = void 0;

var jsDiff = _interopRequireWildcard(require("diff"));

var _utils = require("./utils");

var rematch = _interopRequireWildcard(require("./rematch"));

var _types = require("./types");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var CSSLineClass = {
  INSERTS: 'd2h-ins',
  DELETES: 'd2h-del',
  CONTEXT: 'd2h-cntx',
  INFO: 'd2h-info',
  INSERT_CHANGES: 'd2h-ins d2h-change',
  DELETE_CHANGES: 'd2h-del d2h-change'
};
exports.CSSLineClass = CSSLineClass;
var defaultRenderConfig = {
  matching: _types.LineMatchingType.NONE,
  matchWordsThreshold: 0.25,
  maxLineLengthHighlight: 10000,
  diffStyle: _types.DiffStyleType.WORD
};
exports.defaultRenderConfig = defaultRenderConfig;
var separator = '/';
var distance = rematch.newDistanceFn(function (change) {
  return change.value;
});
var matcher = rematch.newMatcherFn(distance);

function isDevNullName(name) {
  return name.indexOf('dev/null') !== -1;
}

function removeInsElements(line) {
  return line.replace(/(<ins[^>]*>((.|\n)*?)<\/ins>)/g, '');
}

function removeDelElements(line) {
  return line.replace(/(<del[^>]*>((.|\n)*?)<\/del>)/g, '');
}

function toCSSClass(lineType) {
  switch (lineType) {
    case _types.LineType.CONTEXT:
      return CSSLineClass.CONTEXT;

    case _types.LineType.INSERT:
      return CSSLineClass.INSERTS;

    case _types.LineType.DELETE:
      return CSSLineClass.DELETES;
  }
}

function prefixLength(isCombined) {
  return isCombined ? 2 : 1;
}

function escapeForHtml(str) {
  return str.slice(0).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
}

function deconstructLine(line, isCombined, escape) {
  if (escape === void 0) {
    escape = true;
  }

  var indexToSplit = prefixLength(isCombined);
  return {
    prefix: line.substring(0, indexToSplit),
    content: escape ? escapeForHtml(line.substring(indexToSplit)) : line.substring(indexToSplit)
  };
}

function filenameDiff(file) {
  var oldFilename = (0, _utils.unifyPath)(file.oldName);
  var newFilename = (0, _utils.unifyPath)(file.newName);

  if (oldFilename !== newFilename && !isDevNullName(oldFilename) && !isDevNullName(newFilename)) {
    var prefixPaths = [];
    var suffixPaths = [];
    var oldFilenameParts = oldFilename.split(separator);
    var newFilenameParts = newFilename.split(separator);
    var oldFilenamePartsSize = oldFilenameParts.length;
    var newFilenamePartsSize = newFilenameParts.length;
    var i = 0;
    var j = oldFilenamePartsSize - 1;
    var k = newFilenamePartsSize - 1;

    while (i < j && i < k) {
      if (oldFilenameParts[i] === newFilenameParts[i]) {
        prefixPaths.push(newFilenameParts[i]);
        i += 1;
      } else {
        break;
      }
    }

    while (j > i && k > i) {
      if (oldFilenameParts[j] === newFilenameParts[k]) {
        suffixPaths.unshift(newFilenameParts[k]);
        j -= 1;
        k -= 1;
      } else {
        break;
      }
    }

    var finalPrefix = prefixPaths.join(separator);
    var finalSuffix = suffixPaths.join(separator);
    var oldRemainingPath = oldFilenameParts.slice(i, j + 1).join(separator);
    var newRemainingPath = newFilenameParts.slice(i, k + 1).join(separator);

    if (finalPrefix.length && finalSuffix.length) {
      return finalPrefix + separator + '{' + oldRemainingPath + ' → ' + newRemainingPath + '}' + separator + finalSuffix;
    } else if (finalPrefix.length) {
      return finalPrefix + separator + '{' + oldRemainingPath + ' → ' + newRemainingPath + '}';
    } else if (finalSuffix.length) {
      return '{' + oldRemainingPath + ' → ' + newRemainingPath + '}' + separator + finalSuffix;
    }

    return oldFilename + ' → ' + newFilename;
  } else if (!isDevNullName(newFilename)) {
    return newFilename;
  } else {
    return oldFilename;
  }
}

function getHtmlId(file) {
  return "d2h-" + (0, _utils.hashCode)(filenameDiff(file)).toString().slice(-6);
}

function getFileIcon(file) {
  var templateName = 'file-changed';

  if (file.isRename) {
    templateName = 'file-renamed';
  } else if (file.isCopy) {
    templateName = 'file-renamed';
  } else if (file.isNew) {
    templateName = 'file-added';
  } else if (file.isDeleted) {
    templateName = 'file-deleted';
  } else if (file.newName !== file.oldName) {
    templateName = 'file-renamed';
  }

  return templateName;
}

function diffHighlight(diffLine1, diffLine2, isCombined, config) {
  if (config === void 0) {
    config = {};
  }

  var _a = __assign(__assign({}, defaultRenderConfig), config),
      matching = _a.matching,
      maxLineLengthHighlight = _a.maxLineLengthHighlight,
      matchWordsThreshold = _a.matchWordsThreshold,
      diffStyle = _a.diffStyle;

  var line1 = deconstructLine(diffLine1, isCombined, false);
  var line2 = deconstructLine(diffLine2, isCombined, false);

  if (line1.content.length > maxLineLengthHighlight || line2.content.length > maxLineLengthHighlight) {
    return {
      oldLine: {
        prefix: line1.prefix,
        content: line1.content
      },
      newLine: {
        prefix: line2.prefix,
        content: line2.content
      }
    };
  }

  var diff = diffStyle === 'char' ? jsDiff.diffChars(line1.content, line2.content) : jsDiff.diffWordsWithSpace(line1.content, line2.content);
  var changedWords = [];

  if (diffStyle === 'word' && matching === 'words') {
    var removed = diff.filter(function (element) {
      return element.removed;
    });
    var added = diff.filter(function (element) {
      return element.added;
    });
    var chunks = matcher(added, removed);
    chunks.forEach(function (chunk) {
      if (chunk[0].length === 1 && chunk[1].length === 1) {
        var dist = distance(chunk[0][0], chunk[1][0]);

        if (dist < matchWordsThreshold) {
          changedWords.push(chunk[0][0]);
          changedWords.push(chunk[1][0]);
        }
      }
    });
  }

  var highlightedLine = diff.reduce(function (highlightedLine, part) {
    var elemType = part.added ? 'ins' : part.removed ? 'del' : null;
    var addClass = changedWords.indexOf(part) > -1 ? ' class="d2h-change"' : '';
    var escapedValue = escapeForHtml(part.value);
    return elemType !== null ? highlightedLine + "<" + elemType + addClass + ">" + escapedValue + "</" + elemType + ">" : "" + highlightedLine + escapedValue;
  }, '');
  return {
    oldLine: {
      prefix: line1.prefix,
      content: removeInsElements(highlightedLine)
    },
    newLine: {
      prefix: line2.prefix,
      content: removeDelElements(highlightedLine)
    }
  };
}
},{"diff":"../node_modules/diff/dist/diff.js","./utils":"../node_modules/diff2html/lib-esm/utils.js","./rematch":"../node_modules/diff2html/lib-esm/rematch.js","./types":"../node_modules/diff2html/lib-esm/types.js"}],"../node_modules/diff2html/lib-esm/file-list-renderer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = render;

var renderUtils = _interopRequireWildcard(require("./render-utils"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var baseTemplatesPath = 'file-summary';
var iconsBaseTemplatesPath = 'icon';

function render(diffFiles, hoganUtils) {
  var files = diffFiles.map(function (file) {
    return hoganUtils.render(baseTemplatesPath, 'line', {
      fileHtmlId: renderUtils.getHtmlId(file),
      oldName: file.oldName,
      newName: file.newName,
      fileName: renderUtils.filenameDiff(file),
      deletedLines: '-' + file.deletedLines,
      addedLines: '+' + file.addedLines
    }, {
      fileIcon: hoganUtils.template(iconsBaseTemplatesPath, renderUtils.getFileIcon(file))
    });
  }).join('\n');
  return hoganUtils.render(baseTemplatesPath, 'wrapper', {
    filesNumber: diffFiles.length,
    files: files
  });
}
},{"./render-utils":"../node_modules/diff2html/lib-esm/render-utils.js"}],"../node_modules/diff2html/lib-esm/line-by-line-renderer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.defaultLineByLineRendererConfig = void 0;

var Rematch = _interopRequireWildcard(require("./rematch"));

var renderUtils = _interopRequireWildcard(require("./render-utils"));

var _types = require("./types");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var defaultLineByLineRendererConfig = __assign(__assign({}, renderUtils.defaultRenderConfig), {
  renderNothingWhenEmpty: false,
  matchingMaxComparisons: 2500,
  maxLineSizeInBlockForComparison: 200
});

exports.defaultLineByLineRendererConfig = defaultLineByLineRendererConfig;
var genericTemplatesPath = 'generic';
var baseTemplatesPath = 'line-by-line';
var iconsBaseTemplatesPath = 'icon';
var tagsBaseTemplatesPath = 'tag';

var LineByLineRenderer = function () {
  function LineByLineRenderer(hoganUtils, config) {
    if (config === void 0) {
      config = {};
    }

    this.hoganUtils = hoganUtils;
    this.config = __assign(__assign({}, defaultLineByLineRendererConfig), config);
  }

  LineByLineRenderer.prototype.render = function (diffFiles) {
    var _this = this;

    var diffsHtml = diffFiles.map(function (file) {
      var diffs;

      if (file.blocks.length) {
        diffs = _this.generateFileHtml(file);
      } else {
        diffs = _this.generateEmptyDiff();
      }

      return _this.makeFileDiffHtml(file, diffs);
    }).join('\n');
    return this.hoganUtils.render(genericTemplatesPath, 'wrapper', {
      content: diffsHtml
    });
  };

  LineByLineRenderer.prototype.makeFileDiffHtml = function (file, diffs) {
    if (this.config.renderNothingWhenEmpty && Array.isArray(file.blocks) && file.blocks.length === 0) return '';
    var fileDiffTemplate = this.hoganUtils.template(baseTemplatesPath, 'file-diff');
    var filePathTemplate = this.hoganUtils.template(genericTemplatesPath, 'file-path');
    var fileIconTemplate = this.hoganUtils.template(iconsBaseTemplatesPath, 'file');
    var fileTagTemplate = this.hoganUtils.template(tagsBaseTemplatesPath, renderUtils.getFileIcon(file));
    return fileDiffTemplate.render({
      file: file,
      fileHtmlId: renderUtils.getHtmlId(file),
      diffs: diffs,
      filePath: filePathTemplate.render({
        fileDiffName: renderUtils.filenameDiff(file)
      }, {
        fileIcon: fileIconTemplate,
        fileTag: fileTagTemplate
      })
    });
  };

  LineByLineRenderer.prototype.generateEmptyDiff = function () {
    return this.hoganUtils.render(genericTemplatesPath, 'empty-diff', {
      contentClass: 'd2h-code-line',
      CSSLineClass: renderUtils.CSSLineClass
    });
  };

  LineByLineRenderer.prototype.generateFileHtml = function (file) {
    var _this = this;

    var matcher = Rematch.newMatcherFn(Rematch.newDistanceFn(function (e) {
      return renderUtils.deconstructLine(e.content, file.isCombined).content;
    }));
    return file.blocks.map(function (block) {
      var lines = _this.hoganUtils.render(genericTemplatesPath, 'block-header', {
        CSSLineClass: renderUtils.CSSLineClass,
        blockHeader: block.header,
        lineClass: 'd2h-code-linenumber',
        contentClass: 'd2h-code-line'
      });

      _this.applyLineGroupping(block).forEach(function (_a) {
        var contextLines = _a[0],
            oldLines = _a[1],
            newLines = _a[2];

        if (oldLines.length && newLines.length && !contextLines.length) {
          _this.applyRematchMatching(oldLines, newLines, matcher).map(function (_a) {
            var oldLines = _a[0],
                newLines = _a[1];

            var _b = _this.processChangedLines(file.isCombined, oldLines, newLines),
                left = _b.left,
                right = _b.right;

            lines += left;
            lines += right;
          });
        } else if (contextLines.length) {
          contextLines.forEach(function (line) {
            var _a = renderUtils.deconstructLine(line.content, file.isCombined),
                prefix = _a.prefix,
                content = _a.content;

            lines += _this.generateSingleLineHtml({
              type: renderUtils.CSSLineClass.CONTEXT,
              prefix: prefix,
              content: content,
              oldNumber: line.oldNumber,
              newNumber: line.newNumber
            });
          });
        } else if (oldLines.length || newLines.length) {
          var _b = _this.processChangedLines(file.isCombined, oldLines, newLines),
              left = _b.left,
              right = _b.right;

          lines += left;
          lines += right;
        } else {
          console.error('Unknown state reached while processing groups of lines', contextLines, oldLines, newLines);
        }
      });

      return lines;
    }).join('\n');
  };

  LineByLineRenderer.prototype.applyLineGroupping = function (block) {
    var blockLinesGroups = [];
    var oldLines = [];
    var newLines = [];

    for (var i = 0; i < block.lines.length; i++) {
      var diffLine = block.lines[i];

      if (diffLine.type !== _types.LineType.INSERT && newLines.length || diffLine.type === _types.LineType.CONTEXT && oldLines.length > 0) {
        blockLinesGroups.push([[], oldLines, newLines]);
        oldLines = [];
        newLines = [];
      }

      if (diffLine.type === _types.LineType.CONTEXT) {
        blockLinesGroups.push([[diffLine], [], []]);
      } else if (diffLine.type === _types.LineType.INSERT && oldLines.length === 0) {
        blockLinesGroups.push([[], [], [diffLine]]);
      } else if (diffLine.type === _types.LineType.INSERT && oldLines.length > 0) {
        newLines.push(diffLine);
      } else if (diffLine.type === _types.LineType.DELETE) {
        oldLines.push(diffLine);
      }
    }

    if (oldLines.length || newLines.length) {
      blockLinesGroups.push([[], oldLines, newLines]);
      oldLines = [];
      newLines = [];
    }

    return blockLinesGroups;
  };

  LineByLineRenderer.prototype.applyRematchMatching = function (oldLines, newLines, matcher) {
    var comparisons = oldLines.length * newLines.length;
    var maxLineSizeInBlock = Math.max.apply(null, [0].concat(oldLines.concat(newLines).map(function (elem) {
      return elem.content.length;
    })));
    var doMatching = comparisons < this.config.matchingMaxComparisons && maxLineSizeInBlock < this.config.maxLineSizeInBlockForComparison && (this.config.matching === 'lines' || this.config.matching === 'words');
    return doMatching ? matcher(oldLines, newLines) : [[oldLines, newLines]];
  };

  LineByLineRenderer.prototype.processChangedLines = function (isCombined, oldLines, newLines) {
    var fileHtml = {
      right: '',
      left: ''
    };
    var maxLinesNumber = Math.max(oldLines.length, newLines.length);

    for (var i = 0; i < maxLinesNumber; i++) {
      var oldLine = oldLines[i];
      var newLine = newLines[i];
      var diff = oldLine !== undefined && newLine !== undefined ? renderUtils.diffHighlight(oldLine.content, newLine.content, isCombined, this.config) : undefined;
      var preparedOldLine = oldLine !== undefined && oldLine.oldNumber !== undefined ? __assign(__assign({}, diff !== undefined ? {
        prefix: diff.oldLine.prefix,
        content: diff.oldLine.content,
        type: renderUtils.CSSLineClass.DELETE_CHANGES
      } : __assign(__assign({}, renderUtils.deconstructLine(oldLine.content, isCombined)), {
        type: renderUtils.toCSSClass(oldLine.type)
      })), {
        oldNumber: oldLine.oldNumber,
        newNumber: oldLine.newNumber
      }) : undefined;
      var preparedNewLine = newLine !== undefined && newLine.newNumber !== undefined ? __assign(__assign({}, diff !== undefined ? {
        prefix: diff.newLine.prefix,
        content: diff.newLine.content,
        type: renderUtils.CSSLineClass.INSERT_CHANGES
      } : __assign(__assign({}, renderUtils.deconstructLine(newLine.content, isCombined)), {
        type: renderUtils.toCSSClass(newLine.type)
      })), {
        oldNumber: newLine.oldNumber,
        newNumber: newLine.newNumber
      }) : undefined;

      var _a = this.generateLineHtml(preparedOldLine, preparedNewLine),
          left = _a.left,
          right = _a.right;

      fileHtml.left += left;
      fileHtml.right += right;
    }

    return fileHtml;
  };

  LineByLineRenderer.prototype.generateLineHtml = function (oldLine, newLine) {
    return {
      left: this.generateSingleLineHtml(oldLine),
      right: this.generateSingleLineHtml(newLine)
    };
  };

  LineByLineRenderer.prototype.generateSingleLineHtml = function (line) {
    if (line === undefined) return '';
    var lineNumberHtml = this.hoganUtils.render(baseTemplatesPath, 'numbers', {
      oldNumber: line.oldNumber || '',
      newNumber: line.newNumber || ''
    });
    return this.hoganUtils.render(genericTemplatesPath, 'line', {
      type: line.type,
      lineClass: 'd2h-code-linenumber',
      contentClass: 'd2h-code-line',
      prefix: line.prefix === ' ' ? '&nbsp;' : line.prefix,
      content: line.content,
      lineNumber: lineNumberHtml
    });
  };

  return LineByLineRenderer;
}();

var _default = LineByLineRenderer;
exports.default = _default;
},{"./rematch":"../node_modules/diff2html/lib-esm/rematch.js","./render-utils":"../node_modules/diff2html/lib-esm/render-utils.js","./types":"../node_modules/diff2html/lib-esm/types.js"}],"../node_modules/diff2html/lib-esm/side-by-side-renderer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.defaultSideBySideRendererConfig = void 0;

var Rematch = _interopRequireWildcard(require("./rematch"));

var renderUtils = _interopRequireWildcard(require("./render-utils"));

var _types = require("./types");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var defaultSideBySideRendererConfig = __assign(__assign({}, renderUtils.defaultRenderConfig), {
  renderNothingWhenEmpty: false,
  matchingMaxComparisons: 2500,
  maxLineSizeInBlockForComparison: 200
});

exports.defaultSideBySideRendererConfig = defaultSideBySideRendererConfig;
var genericTemplatesPath = 'generic';
var baseTemplatesPath = 'side-by-side';
var iconsBaseTemplatesPath = 'icon';
var tagsBaseTemplatesPath = 'tag';

var SideBySideRenderer = function () {
  function SideBySideRenderer(hoganUtils, config) {
    if (config === void 0) {
      config = {};
    }

    this.hoganUtils = hoganUtils;
    this.config = __assign(__assign({}, defaultSideBySideRendererConfig), config);
  }

  SideBySideRenderer.prototype.render = function (diffFiles) {
    var _this = this;

    var diffsHtml = diffFiles.map(function (file) {
      var diffs;

      if (file.blocks.length) {
        diffs = _this.generateFileHtml(file);
      } else {
        diffs = _this.generateEmptyDiff();
      }

      return _this.makeFileDiffHtml(file, diffs);
    }).join('\n');
    return this.hoganUtils.render(genericTemplatesPath, 'wrapper', {
      content: diffsHtml
    });
  };

  SideBySideRenderer.prototype.makeFileDiffHtml = function (file, diffs) {
    if (this.config.renderNothingWhenEmpty && Array.isArray(file.blocks) && file.blocks.length === 0) return '';
    var fileDiffTemplate = this.hoganUtils.template(baseTemplatesPath, 'file-diff');
    var filePathTemplate = this.hoganUtils.template(genericTemplatesPath, 'file-path');
    var fileIconTemplate = this.hoganUtils.template(iconsBaseTemplatesPath, 'file');
    var fileTagTemplate = this.hoganUtils.template(tagsBaseTemplatesPath, renderUtils.getFileIcon(file));
    return fileDiffTemplate.render({
      file: file,
      fileHtmlId: renderUtils.getHtmlId(file),
      diffs: diffs,
      filePath: filePathTemplate.render({
        fileDiffName: renderUtils.filenameDiff(file)
      }, {
        fileIcon: fileIconTemplate,
        fileTag: fileTagTemplate
      })
    });
  };

  SideBySideRenderer.prototype.generateEmptyDiff = function () {
    return {
      right: '',
      left: this.hoganUtils.render(genericTemplatesPath, 'empty-diff', {
        contentClass: 'd2h-code-side-line',
        CSSLineClass: renderUtils.CSSLineClass
      })
    };
  };

  SideBySideRenderer.prototype.generateFileHtml = function (file) {
    var _this = this;

    var matcher = Rematch.newMatcherFn(Rematch.newDistanceFn(function (e) {
      return renderUtils.deconstructLine(e.content, file.isCombined).content;
    }));
    return file.blocks.map(function (block) {
      var fileHtml = {
        left: _this.makeHeaderHtml(block.header),
        right: _this.makeHeaderHtml('')
      };

      _this.applyLineGroupping(block).forEach(function (_a) {
        var contextLines = _a[0],
            oldLines = _a[1],
            newLines = _a[2];

        if (oldLines.length && newLines.length && !contextLines.length) {
          _this.applyRematchMatching(oldLines, newLines, matcher).map(function (_a) {
            var oldLines = _a[0],
                newLines = _a[1];

            var _b = _this.processChangedLines(file.isCombined, oldLines, newLines),
                left = _b.left,
                right = _b.right;

            fileHtml.left += left;
            fileHtml.right += right;
          });
        } else if (contextLines.length) {
          contextLines.forEach(function (line) {
            var _a = renderUtils.deconstructLine(line.content, file.isCombined),
                prefix = _a.prefix,
                content = _a.content;

            var _b = _this.generateLineHtml({
              type: renderUtils.CSSLineClass.CONTEXT,
              prefix: prefix,
              content: content,
              number: line.oldNumber
            }, {
              type: renderUtils.CSSLineClass.CONTEXT,
              prefix: prefix,
              content: content,
              number: line.newNumber
            }),
                left = _b.left,
                right = _b.right;

            fileHtml.left += left;
            fileHtml.right += right;
          });
        } else if (oldLines.length || newLines.length) {
          var _b = _this.processChangedLines(file.isCombined, oldLines, newLines),
              left = _b.left,
              right = _b.right;

          fileHtml.left += left;
          fileHtml.right += right;
        } else {
          console.error('Unknown state reached while processing groups of lines', contextLines, oldLines, newLines);
        }
      });

      return fileHtml;
    }).reduce(function (accomulated, html) {
      return {
        left: accomulated.left + html.left,
        right: accomulated.right + html.right
      };
    }, {
      left: '',
      right: ''
    });
  };

  SideBySideRenderer.prototype.applyLineGroupping = function (block) {
    var blockLinesGroups = [];
    var oldLines = [];
    var newLines = [];

    for (var i = 0; i < block.lines.length; i++) {
      var diffLine = block.lines[i];

      if (diffLine.type !== _types.LineType.INSERT && newLines.length || diffLine.type === _types.LineType.CONTEXT && oldLines.length > 0) {
        blockLinesGroups.push([[], oldLines, newLines]);
        oldLines = [];
        newLines = [];
      }

      if (diffLine.type === _types.LineType.CONTEXT) {
        blockLinesGroups.push([[diffLine], [], []]);
      } else if (diffLine.type === _types.LineType.INSERT && oldLines.length === 0) {
        blockLinesGroups.push([[], [], [diffLine]]);
      } else if (diffLine.type === _types.LineType.INSERT && oldLines.length > 0) {
        newLines.push(diffLine);
      } else if (diffLine.type === _types.LineType.DELETE) {
        oldLines.push(diffLine);
      }
    }

    if (oldLines.length || newLines.length) {
      blockLinesGroups.push([[], oldLines, newLines]);
      oldLines = [];
      newLines = [];
    }

    return blockLinesGroups;
  };

  SideBySideRenderer.prototype.applyRematchMatching = function (oldLines, newLines, matcher) {
    var comparisons = oldLines.length * newLines.length;
    var maxLineSizeInBlock = Math.max.apply(null, [0].concat(oldLines.concat(newLines).map(function (elem) {
      return elem.content.length;
    })));
    var doMatching = comparisons < this.config.matchingMaxComparisons && maxLineSizeInBlock < this.config.maxLineSizeInBlockForComparison && (this.config.matching === 'lines' || this.config.matching === 'words');
    return doMatching ? matcher(oldLines, newLines) : [[oldLines, newLines]];
  };

  SideBySideRenderer.prototype.makeHeaderHtml = function (blockHeader) {
    return this.hoganUtils.render(genericTemplatesPath, 'block-header', {
      CSSLineClass: renderUtils.CSSLineClass,
      blockHeader: blockHeader,
      lineClass: 'd2h-code-side-linenumber',
      contentClass: 'd2h-code-side-line'
    });
  };

  SideBySideRenderer.prototype.processChangedLines = function (isCombined, oldLines, newLines) {
    var fileHtml = {
      right: '',
      left: ''
    };
    var maxLinesNumber = Math.max(oldLines.length, newLines.length);

    for (var i = 0; i < maxLinesNumber; i++) {
      var oldLine = oldLines[i];
      var newLine = newLines[i];
      var diff = oldLine !== undefined && newLine !== undefined ? renderUtils.diffHighlight(oldLine.content, newLine.content, isCombined, this.config) : undefined;
      var preparedOldLine = oldLine !== undefined && oldLine.oldNumber !== undefined ? __assign(__assign({}, diff !== undefined ? {
        prefix: diff.oldLine.prefix,
        content: diff.oldLine.content,
        type: renderUtils.CSSLineClass.DELETE_CHANGES
      } : __assign(__assign({}, renderUtils.deconstructLine(oldLine.content, isCombined)), {
        type: renderUtils.toCSSClass(oldLine.type)
      })), {
        number: oldLine.oldNumber
      }) : undefined;
      var preparedNewLine = newLine !== undefined && newLine.newNumber !== undefined ? __assign(__assign({}, diff !== undefined ? {
        prefix: diff.newLine.prefix,
        content: diff.newLine.content,
        type: renderUtils.CSSLineClass.INSERT_CHANGES
      } : __assign(__assign({}, renderUtils.deconstructLine(newLine.content, isCombined)), {
        type: renderUtils.toCSSClass(newLine.type)
      })), {
        number: newLine.newNumber
      }) : undefined;

      var _a = this.generateLineHtml(preparedOldLine, preparedNewLine),
          left = _a.left,
          right = _a.right;

      fileHtml.left += left;
      fileHtml.right += right;
    }

    return fileHtml;
  };

  SideBySideRenderer.prototype.generateLineHtml = function (oldLine, newLine) {
    return {
      left: this.generateSingleHtml(oldLine),
      right: this.generateSingleHtml(newLine)
    };
  };

  SideBySideRenderer.prototype.generateSingleHtml = function (line) {
    var lineClass = 'd2h-code-side-linenumber';
    var contentClass = 'd2h-code-side-line';
    return this.hoganUtils.render(genericTemplatesPath, 'line', {
      type: (line === null || line === void 0 ? void 0 : line.type) || renderUtils.CSSLineClass.CONTEXT + " d2h-emptyplaceholder",
      lineClass: line !== undefined ? lineClass : lineClass + " d2h-code-side-emptyplaceholder",
      contentClass: line !== undefined ? contentClass : contentClass + " d2h-code-side-emptyplaceholder",
      prefix: (line === null || line === void 0 ? void 0 : line.prefix) === ' ' ? '&nbsp;' : line === null || line === void 0 ? void 0 : line.prefix,
      content: line === null || line === void 0 ? void 0 : line.content,
      lineNumber: line === null || line === void 0 ? void 0 : line.number
    });
  };

  return SideBySideRenderer;
}();

var _default = SideBySideRenderer;
exports.default = _default;
},{"./rematch":"../node_modules/diff2html/lib-esm/rematch.js","./render-utils":"../node_modules/diff2html/lib-esm/render-utils.js","./types":"../node_modules/diff2html/lib-esm/types.js"}],"../node_modules/hogan.js/lib/compiler.js":[function(require,module,exports) {
/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function (Hogan) {
  // Setup regex  assignments
  // remove whitespace according to Mustache spec
  var rIsWhitespace = /\S/,
      rQuot = /\"/g,
      rNewline =  /\n/g,
      rCr = /\r/g,
      rSlash = /\\/g,
      rLineSep = /\u2028/,
      rParagraphSep = /\u2029/;

  Hogan.tags = {
    '#': 1, '^': 2, '<': 3, '$': 4,
    '/': 5, '!': 6, '>': 7, '=': 8, '_v': 9,
    '{': 10, '&': 11, '_t': 12
  };

  Hogan.scan = function scan(text, delimiters) {
    var len = text.length,
        IN_TEXT = 0,
        IN_TAG_TYPE = 1,
        IN_TAG = 2,
        state = IN_TEXT,
        tagType = null,
        tag = null,
        buf = '',
        tokens = [],
        seenTag = false,
        i = 0,
        lineStart = 0,
        otag = '{{',
        ctag = '}}';

    function addBuf() {
      if (buf.length > 0) {
        tokens.push({tag: '_t', text: new String(buf)});
        buf = '';
      }
    }

    function lineIsWhitespace() {
      var isAllWhitespace = true;
      for (var j = lineStart; j < tokens.length; j++) {
        isAllWhitespace =
          (Hogan.tags[tokens[j].tag] < Hogan.tags['_v']) ||
          (tokens[j].tag == '_t' && tokens[j].text.match(rIsWhitespace) === null);
        if (!isAllWhitespace) {
          return false;
        }
      }

      return isAllWhitespace;
    }

    function filterLine(haveSeenTag, noNewLine) {
      addBuf();

      if (haveSeenTag && lineIsWhitespace()) {
        for (var j = lineStart, next; j < tokens.length; j++) {
          if (tokens[j].text) {
            if ((next = tokens[j+1]) && next.tag == '>') {
              // set indent to token value
              next.indent = tokens[j].text.toString()
            }
            tokens.splice(j, 1);
          }
        }
      } else if (!noNewLine) {
        tokens.push({tag:'\n'});
      }

      seenTag = false;
      lineStart = tokens.length;
    }

    function changeDelimiters(text, index) {
      var close = '=' + ctag,
          closeIndex = text.indexOf(close, index),
          delimiters = trim(
            text.substring(text.indexOf('=', index) + 1, closeIndex)
          ).split(' ');

      otag = delimiters[0];
      ctag = delimiters[delimiters.length - 1];

      return closeIndex + close.length - 1;
    }

    if (delimiters) {
      delimiters = delimiters.split(' ');
      otag = delimiters[0];
      ctag = delimiters[1];
    }

    for (i = 0; i < len; i++) {
      if (state == IN_TEXT) {
        if (tagChange(otag, text, i)) {
          --i;
          addBuf();
          state = IN_TAG_TYPE;
        } else {
          if (text.charAt(i) == '\n') {
            filterLine(seenTag);
          } else {
            buf += text.charAt(i);
          }
        }
      } else if (state == IN_TAG_TYPE) {
        i += otag.length - 1;
        tag = Hogan.tags[text.charAt(i + 1)];
        tagType = tag ? text.charAt(i + 1) : '_v';
        if (tagType == '=') {
          i = changeDelimiters(text, i);
          state = IN_TEXT;
        } else {
          if (tag) {
            i++;
          }
          state = IN_TAG;
        }
        seenTag = i;
      } else {
        if (tagChange(ctag, text, i)) {
          tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
                       i: (tagType == '/') ? seenTag - otag.length : i + ctag.length});
          buf = '';
          i += ctag.length - 1;
          state = IN_TEXT;
          if (tagType == '{') {
            if (ctag == '}}') {
              i++;
            } else {
              cleanTripleStache(tokens[tokens.length - 1]);
            }
          }
        } else {
          buf += text.charAt(i);
        }
      }
    }

    filterLine(seenTag, true);

    return tokens;
  }

  function cleanTripleStache(token) {
    if (token.n.substr(token.n.length - 1) === '}') {
      token.n = token.n.substring(0, token.n.length - 1);
    }
  }

  function trim(s) {
    if (s.trim) {
      return s.trim();
    }

    return s.replace(/^\s*|\s*$/g, '');
  }

  function tagChange(tag, text, index) {
    if (text.charAt(index) != tag.charAt(0)) {
      return false;
    }

    for (var i = 1, l = tag.length; i < l; i++) {
      if (text.charAt(index + i) != tag.charAt(i)) {
        return false;
      }
    }

    return true;
  }

  // the tags allowed inside super templates
  var allowedInSuper = {'_t': true, '\n': true, '$': true, '/': true};

  function buildTree(tokens, kind, stack, customTags) {
    var instructions = [],
        opener = null,
        tail = null,
        token = null;

    tail = stack[stack.length - 1];

    while (tokens.length > 0) {
      token = tokens.shift();

      if (tail && tail.tag == '<' && !(token.tag in allowedInSuper)) {
        throw new Error('Illegal content in < super tag.');
      }

      if (Hogan.tags[token.tag] <= Hogan.tags['$'] || isOpener(token, customTags)) {
        stack.push(token);
        token.nodes = buildTree(tokens, token.tag, stack, customTags);
      } else if (token.tag == '/') {
        if (stack.length === 0) {
          throw new Error('Closing tag without opener: /' + token.n);
        }
        opener = stack.pop();
        if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
          throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
        }
        opener.end = token.i;
        return instructions;
      } else if (token.tag == '\n') {
        token.last = (tokens.length == 0) || (tokens[0].tag == '\n');
      }

      instructions.push(token);
    }

    if (stack.length > 0) {
      throw new Error('missing closing tag: ' + stack.pop().n);
    }

    return instructions;
  }

  function isOpener(token, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].o == token.n) {
        token.tag = '#';
        return true;
      }
    }
  }

  function isCloser(close, open, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].c == close && tags[i].o == open) {
        return true;
      }
    }
  }

  function stringifySubstitutions(obj) {
    var items = [];
    for (var key in obj) {
      items.push('"' + esc(key) + '": function(c,p,t,i) {' + obj[key] + '}');
    }
    return "{ " + items.join(",") + " }";
  }

  function stringifyPartials(codeObj) {
    var partials = [];
    for (var key in codeObj.partials) {
      partials.push('"' + esc(key) + '":{name:"' + esc(codeObj.partials[key].name) + '", ' + stringifyPartials(codeObj.partials[key]) + "}");
    }
    return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
  }

  Hogan.stringify = function(codeObj, text, options) {
    return "{code: function (c,p,i) { " + Hogan.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) +  "}";
  }

  var serialNo = 0;
  Hogan.generate = function(tree, text, options) {
    serialNo = 0;
    var context = { code: '', subs: {}, partials: {} };
    Hogan.walk(tree, context);

    if (options.asString) {
      return this.stringify(context, text, options);
    }

    return this.makeTemplate(context, text, options);
  }

  Hogan.wrapMain = function(code) {
    return 'var t=this;t.b(i=i||"");' + code + 'return t.fl();';
  }

  Hogan.template = Hogan.Template;

  Hogan.makeTemplate = function(codeObj, text, options) {
    var template = this.makePartials(codeObj);
    template.code = new Function('c', 'p', 'i', this.wrapMain(codeObj.code));
    return new this.template(template, text, this, options);
  }

  Hogan.makePartials = function(codeObj) {
    var key, template = {subs: {}, partials: codeObj.partials, name: codeObj.name};
    for (key in template.partials) {
      template.partials[key] = this.makePartials(template.partials[key]);
    }
    for (key in codeObj.subs) {
      template.subs[key] = new Function('c', 'p', 't', 'i', codeObj.subs[key]);
    }
    return template;
  }

  function esc(s) {
    return s.replace(rSlash, '\\\\')
            .replace(rQuot, '\\\"')
            .replace(rNewline, '\\n')
            .replace(rCr, '\\r')
            .replace(rLineSep, '\\u2028')
            .replace(rParagraphSep, '\\u2029');
  }

  function chooseMethod(s) {
    return (~s.indexOf('.')) ? 'd' : 'f';
  }

  function createPartial(node, context) {
    var prefix = "<" + (context.prefix || "");
    var sym = prefix + node.n + serialNo++;
    context.partials[sym] = {name: node.n, partials: {}};
    context.code += 't.b(t.rp("' +  esc(sym) + '",c,p,"' + (node.indent || '') + '"));';
    return sym;
  }

  Hogan.codegen = {
    '#': function(node, context) {
      context.code += 'if(t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),' +
                      'c,p,0,' + node.i + ',' + node.end + ',"' + node.otag + " " + node.ctag + '")){' +
                      't.rs(c,p,' + 'function(c,p,t){';
      Hogan.walk(node.nodes, context);
      context.code += '});c.pop();}';
    },

    '^': function(node, context) {
      context.code += 'if(!t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
      Hogan.walk(node.nodes, context);
      context.code += '};';
    },

    '>': createPartial,
    '<': function(node, context) {
      var ctx = {partials: {}, code: '', subs: {}, inPartial: true};
      Hogan.walk(node.nodes, ctx);
      var template = context.partials[createPartial(node, context)];
      template.subs = ctx.subs;
      template.partials = ctx.partials;
    },

    '$': function(node, context) {
      var ctx = {subs: {}, code: '', partials: context.partials, prefix: node.n};
      Hogan.walk(node.nodes, ctx);
      context.subs[node.n] = ctx.code;
      if (!context.inPartial) {
        context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
      }
    },

    '\n': function(node, context) {
      context.code += write('"\\n"' + (node.last ? '' : ' + i'));
    },

    '_v': function(node, context) {
      context.code += 't.b(t.v(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
    },

    '_t': function(node, context) {
      context.code += write('"' + esc(node.text) + '"');
    },

    '{': tripleStache,

    '&': tripleStache
  }

  function tripleStache(node, context) {
    context.code += 't.b(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
  }

  function write(s) {
    return 't.b(' + s + ');';
  }

  Hogan.walk = function(nodelist, context) {
    var func;
    for (var i = 0, l = nodelist.length; i < l; i++) {
      func = Hogan.codegen[nodelist[i].tag];
      func && func(nodelist[i], context);
    }
    return context;
  }

  Hogan.parse = function(tokens, text, options) {
    options = options || {};
    return buildTree(tokens, '', [], options.sectionTags || []);
  }

  Hogan.cache = {};

  Hogan.cacheKey = function(text, options) {
    return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join('||');
  }

  Hogan.compile = function(text, options) {
    options = options || {};
    var key = Hogan.cacheKey(text, options);
    var template = this.cache[key];

    if (template) {
      var partials = template.partials;
      for (var name in partials) {
        delete partials[name].instance;
      }
      return template;
    }

    template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
    return this.cache[key] = template;
  }
})(typeof exports !== 'undefined' ? exports : Hogan);

},{}],"../node_modules/hogan.js/lib/template.js":[function(require,module,exports) {
/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var Hogan = {};

(function (Hogan) {
  Hogan.Template = function (codeObj, text, compiler, options) {
    codeObj = codeObj || {};
    this.r = codeObj.code || this.r;
    this.c = compiler;
    this.options = options || {};
    this.text = text || '';
    this.partials = codeObj.partials || {};
    this.subs = codeObj.subs || {};
    this.buf = '';
  }

  Hogan.Template.prototype = {
    // render: replaced by generated code.
    r: function (context, partials, indent) { return ''; },

    // variable escaping
    v: hoganEscape,

    // triple stache
    t: coerceToString,

    render: function render(context, partials, indent) {
      return this.ri([context], partials || {}, indent);
    },

    // render internal -- a hook for overrides that catches partials too
    ri: function (context, partials, indent) {
      return this.r(context, partials, indent);
    },

    // ensurePartial
    ep: function(symbol, partials) {
      var partial = this.partials[symbol];

      // check to see that if we've instantiated this partial before
      var template = partials[partial.name];
      if (partial.instance && partial.base == template) {
        return partial.instance;
      }

      if (typeof template == 'string') {
        if (!this.c) {
          throw new Error("No compiler available.");
        }
        template = this.c.compile(template, this.options);
      }

      if (!template) {
        return null;
      }

      // We use this to check whether the partials dictionary has changed
      this.partials[symbol].base = template;

      if (partial.subs) {
        // Make sure we consider parent template now
        if (!partials.stackText) partials.stackText = {};
        for (key in partial.subs) {
          if (!partials.stackText[key]) {
            partials.stackText[key] = (this.activeSub !== undefined && partials.stackText[this.activeSub]) ? partials.stackText[this.activeSub] : this.text;
          }
        }
        template = createSpecializedPartial(template, partial.subs, partial.partials,
          this.stackSubs, this.stackPartials, partials.stackText);
      }
      this.partials[symbol].instance = template;

      return template;
    },

    // tries to find a partial in the current scope and render it
    rp: function(symbol, context, partials, indent) {
      var partial = this.ep(symbol, partials);
      if (!partial) {
        return '';
      }

      return partial.ri(context, partials, indent);
    },

    // render a section
    rs: function(context, partials, section) {
      var tail = context[context.length - 1];

      if (!isArray(tail)) {
        section(context, partials, this);
        return;
      }

      for (var i = 0; i < tail.length; i++) {
        context.push(tail[i]);
        section(context, partials, this);
        context.pop();
      }
    },

    // maybe start a section
    s: function(val, ctx, partials, inverted, start, end, tags) {
      var pass;

      if (isArray(val) && val.length === 0) {
        return false;
      }

      if (typeof val == 'function') {
        val = this.ms(val, ctx, partials, inverted, start, end, tags);
      }

      pass = !!val;

      if (!inverted && pass && ctx) {
        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
      }

      return pass;
    },

    // find values with dotted names
    d: function(key, ctx, partials, returnFound) {
      var found,
          names = key.split('.'),
          val = this.f(names[0], ctx, partials, returnFound),
          doModelGet = this.options.modelGet,
          cx = null;

      if (key === '.' && isArray(ctx[ctx.length - 2])) {
        val = ctx[ctx.length - 1];
      } else {
        for (var i = 1; i < names.length; i++) {
          found = findInScope(names[i], val, doModelGet);
          if (found !== undefined) {
            cx = val;
            val = found;
          } else {
            val = '';
          }
        }
      }

      if (returnFound && !val) {
        return false;
      }

      if (!returnFound && typeof val == 'function') {
        ctx.push(cx);
        val = this.mv(val, ctx, partials);
        ctx.pop();
      }

      return val;
    },

    // find values with normal names
    f: function(key, ctx, partials, returnFound) {
      var val = false,
          v = null,
          found = false,
          doModelGet = this.options.modelGet;

      for (var i = ctx.length - 1; i >= 0; i--) {
        v = ctx[i];
        val = findInScope(key, v, doModelGet);
        if (val !== undefined) {
          found = true;
          break;
        }
      }

      if (!found) {
        return (returnFound) ? false : "";
      }

      if (!returnFound && typeof val == 'function') {
        val = this.mv(val, ctx, partials);
      }

      return val;
    },

    // higher order templates
    ls: function(func, cx, partials, text, tags) {
      var oldTags = this.options.delimiters;

      this.options.delimiters = tags;
      this.b(this.ct(coerceToString(func.call(cx, text)), cx, partials));
      this.options.delimiters = oldTags;

      return false;
    },

    // compile text
    ct: function(text, cx, partials) {
      if (this.options.disableLambda) {
        throw new Error('Lambda features disabled.');
      }
      return this.c.compile(text, this.options).render(cx, partials);
    },

    // template result buffering
    b: function(s) { this.buf += s; },

    fl: function() { var r = this.buf; this.buf = ''; return r; },

    // method replace section
    ms: function(func, ctx, partials, inverted, start, end, tags) {
      var textSource,
          cx = ctx[ctx.length - 1],
          result = func.call(cx);

      if (typeof result == 'function') {
        if (inverted) {
          return true;
        } else {
          textSource = (this.activeSub && this.subsText && this.subsText[this.activeSub]) ? this.subsText[this.activeSub] : this.text;
          return this.ls(result, cx, partials, textSource.substring(start, end), tags);
        }
      }

      return result;
    },

    // method replace variable
    mv: function(func, ctx, partials) {
      var cx = ctx[ctx.length - 1];
      var result = func.call(cx);

      if (typeof result == 'function') {
        return this.ct(coerceToString(result.call(cx)), cx, partials);
      }

      return result;
    },

    sub: function(name, context, partials, indent) {
      var f = this.subs[name];
      if (f) {
        this.activeSub = name;
        f(context, partials, this, indent);
        this.activeSub = false;
      }
    }

  };

  //Find a key in an object
  function findInScope(key, scope, doModelGet) {
    var val;

    if (scope && typeof scope == 'object') {

      if (scope[key] !== undefined) {
        val = scope[key];

      // try lookup with get for backbone or similar model data
      } else if (doModelGet && scope.get && typeof scope.get == 'function') {
        val = scope.get(key);
      }
    }

    return val;
  }

  function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
    function PartialTemplate() {};
    PartialTemplate.prototype = instance;
    function Substitutions() {};
    Substitutions.prototype = instance.subs;
    var key;
    var partial = new PartialTemplate();
    partial.subs = new Substitutions();
    partial.subsText = {};  //hehe. substext.
    partial.buf = '';

    stackSubs = stackSubs || {};
    partial.stackSubs = stackSubs;
    partial.subsText = stackText;
    for (key in subs) {
      if (!stackSubs[key]) stackSubs[key] = subs[key];
    }
    for (key in stackSubs) {
      partial.subs[key] = stackSubs[key];
    }

    stackPartials = stackPartials || {};
    partial.stackPartials = stackPartials;
    for (key in partials) {
      if (!stackPartials[key]) stackPartials[key] = partials[key];
    }
    for (key in stackPartials) {
      partial.partials[key] = stackPartials[key];
    }

    return partial;
  }

  var rAmp = /&/g,
      rLt = /</g,
      rGt = />/g,
      rApos = /\'/g,
      rQuot = /\"/g,
      hChars = /[&<>\"\']/;

  function coerceToString(val) {
    return String((val === null || val === undefined) ? '' : val);
  }

  function hoganEscape(str) {
    str = coerceToString(str);
    return hChars.test(str) ?
      str
        .replace(rAmp, '&amp;')
        .replace(rLt, '&lt;')
        .replace(rGt, '&gt;')
        .replace(rApos, '&#39;')
        .replace(rQuot, '&quot;') :
      str;
  }

  var isArray = Array.isArray || function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  };

})(typeof exports !== 'undefined' ? exports : Hogan);

},{}],"../node_modules/hogan.js/lib/hogan.js":[function(require,module,exports) {
/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// This file is for use with Node.js. See dist/ for browser files.

var Hogan = require('./compiler');
Hogan.Template = require('./template').Template;
Hogan.template = Hogan.Template;
module.exports = Hogan;

},{"./compiler":"../node_modules/hogan.js/lib/compiler.js","./template":"../node_modules/hogan.js/lib/template.js"}],"../node_modules/diff2html/lib-esm/diff2html-templates.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultTemplates = void 0;

var Hogan = _interopRequireWildcard(require("hogan.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var defaultTemplates = {};
exports.defaultTemplates = defaultTemplates;
defaultTemplates["file-summary-line"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<li class=\"d2h-file-list-line\">");
    t.b("\n" + i);
    t.b("    <span class=\"d2h-file-name-wrapper\">");
    t.b("\n" + i);
    t.b(t.rp("<fileIcon0", c, p, "      "));
    t.b("      <a href=\"#");
    t.b(t.v(t.f("fileHtmlId", c, p, 0)));
    t.b("\" class=\"d2h-file-name\">");
    t.b(t.v(t.f("fileName", c, p, 0)));
    t.b("</a>");
    t.b("\n" + i);
    t.b("      <span class=\"d2h-file-stats\">");
    t.b("\n" + i);
    t.b("          <span class=\"d2h-lines-added\">");
    t.b(t.v(t.f("addedLines", c, p, 0)));
    t.b("</span>");
    t.b("\n" + i);
    t.b("          <span class=\"d2h-lines-deleted\">");
    t.b(t.v(t.f("deletedLines", c, p, 0)));
    t.b("</span>");
    t.b("\n" + i);
    t.b("      </span>");
    t.b("\n" + i);
    t.b("    </span>");
    t.b("\n" + i);
    t.b("</li>");
    return t.fl();
  },
  partials: {
    "<fileIcon0": {
      name: "fileIcon",
      partials: {},
      subs: {}
    }
  },
  subs: {}
});
defaultTemplates["file-summary-wrapper"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<div class=\"d2h-file-list-wrapper\">");
    t.b("\n" + i);
    t.b("    <div class=\"d2h-file-list-header\">");
    t.b("\n" + i);
    t.b("        <span class=\"d2h-file-list-title\">Files changed (");
    t.b(t.v(t.f("filesNumber", c, p, 0)));
    t.b(")</span>");
    t.b("\n" + i);
    t.b("        <a class=\"d2h-file-switch d2h-hide\">hide</a>");
    t.b("\n" + i);
    t.b("        <a class=\"d2h-file-switch d2h-show\">show</a>");
    t.b("\n" + i);
    t.b("    </div>");
    t.b("\n" + i);
    t.b("    <ol class=\"d2h-file-list\">");
    t.b("\n" + i);
    t.b("    ");
    t.b(t.t(t.f("files", c, p, 0)));
    t.b("\n" + i);
    t.b("    </ol>");
    t.b("\n" + i);
    t.b("</div>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["generic-block-header"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<tr>");
    t.b("\n" + i);
    t.b("    <td class=\"");
    t.b(t.v(t.f("lineClass", c, p, 0)));
    t.b(" ");
    t.b(t.v(t.d("CSSLineClass.INFO", c, p, 0)));
    t.b("\"></td>");
    t.b("\n" + i);
    t.b("    <td class=\"");
    t.b(t.v(t.d("CSSLineClass.INFO", c, p, 0)));
    t.b("\">");
    t.b("\n" + i);
    t.b("        <div class=\"");
    t.b(t.v(t.f("contentClass", c, p, 0)));
    t.b(" ");
    t.b(t.v(t.d("CSSLineClass.INFO", c, p, 0)));
    t.b("\">");
    t.b(t.t(t.f("blockHeader", c, p, 0)));
    t.b("</div>");
    t.b("\n" + i);
    t.b("    </td>");
    t.b("\n" + i);
    t.b("</tr>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["generic-empty-diff"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<tr>");
    t.b("\n" + i);
    t.b("    <td class=\"");
    t.b(t.v(t.d("CSSLineClass.INFO", c, p, 0)));
    t.b("\">");
    t.b("\n" + i);
    t.b("        <div class=\"");
    t.b(t.v(t.f("contentClass", c, p, 0)));
    t.b(" ");
    t.b(t.v(t.d("CSSLineClass.INFO", c, p, 0)));
    t.b("\">");
    t.b("\n" + i);
    t.b("            File without changes");
    t.b("\n" + i);
    t.b("        </div>");
    t.b("\n" + i);
    t.b("    </td>");
    t.b("\n" + i);
    t.b("</tr>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["generic-file-path"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<span class=\"d2h-file-name-wrapper\">");
    t.b("\n" + i);
    t.b(t.rp("<fileIcon0", c, p, "    "));
    t.b("    <span class=\"d2h-file-name\">");
    t.b(t.v(t.f("fileDiffName", c, p, 0)));
    t.b("</span>");
    t.b("\n" + i);
    t.b(t.rp("<fileTag1", c, p, "    "));
    t.b("</span>");
    return t.fl();
  },
  partials: {
    "<fileIcon0": {
      name: "fileIcon",
      partials: {},
      subs: {}
    },
    "<fileTag1": {
      name: "fileTag",
      partials: {},
      subs: {}
    }
  },
  subs: {}
});
defaultTemplates["generic-line"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<tr>");
    t.b("\n" + i);
    t.b("    <td class=\"");
    t.b(t.v(t.f("lineClass", c, p, 0)));
    t.b(" ");
    t.b(t.v(t.f("type", c, p, 0)));
    t.b("\">");
    t.b("\n" + i);
    t.b("      ");
    t.b(t.t(t.f("lineNumber", c, p, 0)));
    t.b("\n" + i);
    t.b("    </td>");
    t.b("\n" + i);
    t.b("    <td class=\"");
    t.b(t.v(t.f("type", c, p, 0)));
    t.b("\">");
    t.b("\n" + i);
    t.b("        <div class=\"");
    t.b(t.v(t.f("contentClass", c, p, 0)));
    t.b(" ");
    t.b(t.v(t.f("type", c, p, 0)));
    t.b("\">");
    t.b("\n" + i);

    if (t.s(t.f("prefix", c, p, 1), c, p, 0, 171, 247, "{{ }}")) {
      t.rs(c, p, function (c, p, t) {
        t.b("            <span class=\"d2h-code-line-prefix\">");
        t.b(t.t(t.f("prefix", c, p, 0)));
        t.b("</span>");
        t.b("\n" + i);
      });
      c.pop();
    }

    if (!t.s(t.f("prefix", c, p, 1), c, p, 1, 0, 0, "")) {
      t.b("            <span class=\"d2h-code-line-prefix\">&nbsp;</span>");
      t.b("\n" + i);
    }

    ;

    if (t.s(t.f("content", c, p, 1), c, p, 0, 380, 454, "{{ }}")) {
      t.rs(c, p, function (c, p, t) {
        t.b("            <span class=\"d2h-code-line-ctn\">");
        t.b(t.t(t.f("content", c, p, 0)));
        t.b("</span>");
        t.b("\n" + i);
      });
      c.pop();
    }

    if (!t.s(t.f("content", c, p, 1), c, p, 1, 0, 0, "")) {
      t.b("            <span class=\"d2h-code-line-ctn\"><br></span>");
      t.b("\n" + i);
    }

    ;
    t.b("        </div>");
    t.b("\n" + i);
    t.b("    </td>");
    t.b("\n" + i);
    t.b("</tr>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["generic-wrapper"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<div class=\"d2h-wrapper\">");
    t.b("\n" + i);
    t.b("    ");
    t.b(t.t(t.f("content", c, p, 0)));
    t.b("\n" + i);
    t.b("</div>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["icon-file-added"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<svg aria-hidden=\"true\" class=\"d2h-icon d2h-added\" height=\"16\" title=\"added\" version=\"1.1\" viewBox=\"0 0 14 16\"");
    t.b("\n" + i);
    t.b("     width=\"14\">");
    t.b("\n" + i);
    t.b("    <path d=\"M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM6 9H3V7h3V4h2v3h3v2H8v3H6V9z\"></path>");
    t.b("\n" + i);
    t.b("</svg>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["icon-file-changed"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<svg aria-hidden=\"true\" class=\"d2h-icon d2h-changed\" height=\"16\" title=\"modified\" version=\"1.1\"");
    t.b("\n" + i);
    t.b("     viewBox=\"0 0 14 16\" width=\"14\">");
    t.b("\n" + i);
    t.b("    <path d=\"M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z\"></path>");
    t.b("\n" + i);
    t.b("</svg>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["icon-file-deleted"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<svg aria-hidden=\"true\" class=\"d2h-icon d2h-deleted\" height=\"16\" title=\"removed\" version=\"1.1\"");
    t.b("\n" + i);
    t.b("     viewBox=\"0 0 14 16\" width=\"14\">");
    t.b("\n" + i);
    t.b("    <path d=\"M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM11 9H3V7h8v2z\"></path>");
    t.b("\n" + i);
    t.b("</svg>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["icon-file-renamed"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<svg aria-hidden=\"true\" class=\"d2h-icon d2h-moved\" height=\"16\" title=\"renamed\" version=\"1.1\"");
    t.b("\n" + i);
    t.b("     viewBox=\"0 0 14 16\" width=\"14\">");
    t.b("\n" + i);
    t.b("    <path d=\"M6 9H3V7h3V4l5 4-5 4V9z m8-7v12c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h12c0.55 0 1 0.45 1 1z m-1 0H1v12h12V2z\"></path>");
    t.b("\n" + i);
    t.b("</svg>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["icon-file"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<svg aria-hidden=\"true\" class=\"d2h-icon\" height=\"16\" version=\"1.1\" viewBox=\"0 0 12 16\" width=\"12\">");
    t.b("\n" + i);
    t.b("    <path d=\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\"></path>");
    t.b("\n" + i);
    t.b("</svg>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["line-by-line-file-diff"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<div id=\"");
    t.b(t.v(t.f("fileHtmlId", c, p, 0)));
    t.b("\" class=\"d2h-file-wrapper\" data-lang=\"");
    t.b(t.v(t.d("file.language", c, p, 0)));
    t.b("\">");
    t.b("\n" + i);
    t.b("    <div class=\"d2h-file-header\">");
    t.b("\n" + i);
    t.b("    ");
    t.b(t.t(t.f("filePath", c, p, 0)));
    t.b("\n" + i);
    t.b("    </div>");
    t.b("\n" + i);
    t.b("    <div class=\"d2h-file-diff\">");
    t.b("\n" + i);
    t.b("        <div class=\"d2h-code-wrapper\">");
    t.b("\n" + i);
    t.b("            <table class=\"d2h-diff-table\">");
    t.b("\n" + i);
    t.b("                <tbody class=\"d2h-diff-tbody\">");
    t.b("\n" + i);
    t.b("                ");
    t.b(t.t(t.f("diffs", c, p, 0)));
    t.b("\n" + i);
    t.b("                </tbody>");
    t.b("\n" + i);
    t.b("            </table>");
    t.b("\n" + i);
    t.b("        </div>");
    t.b("\n" + i);
    t.b("    </div>");
    t.b("\n" + i);
    t.b("</div>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["line-by-line-numbers"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<div class=\"line-num1\">");
    t.b(t.v(t.f("oldNumber", c, p, 0)));
    t.b("</div>");
    t.b("\n" + i);
    t.b("<div class=\"line-num2\">");
    t.b(t.v(t.f("newNumber", c, p, 0)));
    t.b("</div>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["side-by-side-file-diff"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<div id=\"");
    t.b(t.v(t.f("fileHtmlId", c, p, 0)));
    t.b("\" class=\"d2h-file-wrapper\" data-lang=\"");
    t.b(t.v(t.d("file.language", c, p, 0)));
    t.b("\">");
    t.b("\n" + i);
    t.b("    <div class=\"d2h-file-header\">");
    t.b("\n" + i);
    t.b("      ");
    t.b(t.t(t.f("filePath", c, p, 0)));
    t.b("\n" + i);
    t.b("    </div>");
    t.b("\n" + i);
    t.b("    <div class=\"d2h-files-diff\">");
    t.b("\n" + i);
    t.b("        <div class=\"d2h-file-side-diff\">");
    t.b("\n" + i);
    t.b("            <div class=\"d2h-code-wrapper\">");
    t.b("\n" + i);
    t.b("                <table class=\"d2h-diff-table\">");
    t.b("\n" + i);
    t.b("                    <tbody class=\"d2h-diff-tbody\">");
    t.b("\n" + i);
    t.b("                    ");
    t.b(t.t(t.d("diffs.left", c, p, 0)));
    t.b("\n" + i);
    t.b("                    </tbody>");
    t.b("\n" + i);
    t.b("                </table>");
    t.b("\n" + i);
    t.b("            </div>");
    t.b("\n" + i);
    t.b("        </div>");
    t.b("\n" + i);
    t.b("        <div class=\"d2h-file-side-diff\">");
    t.b("\n" + i);
    t.b("            <div class=\"d2h-code-wrapper\">");
    t.b("\n" + i);
    t.b("                <table class=\"d2h-diff-table\">");
    t.b("\n" + i);
    t.b("                    <tbody class=\"d2h-diff-tbody\">");
    t.b("\n" + i);
    t.b("                    ");
    t.b(t.t(t.d("diffs.right", c, p, 0)));
    t.b("\n" + i);
    t.b("                    </tbody>");
    t.b("\n" + i);
    t.b("                </table>");
    t.b("\n" + i);
    t.b("            </div>");
    t.b("\n" + i);
    t.b("        </div>");
    t.b("\n" + i);
    t.b("    </div>");
    t.b("\n" + i);
    t.b("</div>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["tag-file-added"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<span class=\"d2h-tag d2h-added d2h-added-tag\">ADDED</span>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["tag-file-changed"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<span class=\"d2h-tag d2h-changed d2h-changed-tag\">CHANGED</span>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["tag-file-deleted"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<span class=\"d2h-tag d2h-deleted d2h-deleted-tag\">DELETED</span>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
defaultTemplates["tag-file-renamed"] = new Hogan.Template({
  code: function code(c, p, i) {
    var t = this;
    t.b(i = i || "");
    t.b("<span class=\"d2h-tag d2h-moved d2h-moved-tag\">RENAMED</span>");
    return t.fl();
  },
  partials: {},
  subs: {}
});
},{"hogan.js":"../node_modules/hogan.js/lib/hogan.js"}],"../node_modules/diff2html/lib-esm/hoganjs-utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var Hogan = _interopRequireWildcard(require("hogan.js"));

var _diff2htmlTemplates = require("./diff2html-templates");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var HoganJsUtils = function () {
  function HoganJsUtils(_a) {
    var _b = _a.compiledTemplates,
        compiledTemplates = _b === void 0 ? {} : _b,
        _c = _a.rawTemplates,
        rawTemplates = _c === void 0 ? {} : _c;
    var compiledRawTemplates = Object.entries(rawTemplates).reduce(function (previousTemplates, _a) {
      var _b;

      var name = _a[0],
          templateString = _a[1];
      var compiledTemplate = Hogan.compile(templateString, {
        asString: false
      });
      return __assign(__assign({}, previousTemplates), (_b = {}, _b[name] = compiledTemplate, _b));
    }, {});
    this.preCompiledTemplates = __assign(__assign(__assign({}, _diff2htmlTemplates.defaultTemplates), compiledTemplates), compiledRawTemplates);
  }

  HoganJsUtils.compile = function (templateString) {
    return Hogan.compile(templateString, {
      asString: false
    });
  };

  HoganJsUtils.prototype.render = function (namespace, view, params, partials, indent) {
    var templateKey = this.templateKey(namespace, view);

    try {
      var template = this.preCompiledTemplates[templateKey];
      return template.render(params, partials, indent);
    } catch (e) {
      throw new Error("Could not find template to render '" + templateKey + "'");
    }
  };

  HoganJsUtils.prototype.template = function (namespace, view) {
    return this.preCompiledTemplates[this.templateKey(namespace, view)];
  };

  HoganJsUtils.prototype.templateKey = function (namespace, view) {
    return namespace + "-" + view;
  };

  return HoganJsUtils;
}();

var _default = HoganJsUtils;
exports.default = _default;
},{"hogan.js":"../node_modules/hogan.js/lib/hogan.js","./diff2html-templates":"../node_modules/diff2html/lib-esm/diff2html-templates.js"}],"../node_modules/diff2html/lib-esm/diff2html.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.html = html;
exports.defaultDiff2HtmlConfig = void 0;

var DiffParser = _interopRequireWildcard(require("./diff-parser"));

var fileListPrinter = _interopRequireWildcard(require("./file-list-renderer"));

var _lineByLineRenderer = _interopRequireWildcard(require("./line-by-line-renderer"));

var _sideBySideRenderer = _interopRequireWildcard(require("./side-by-side-renderer"));

var _types = require("./types");

var _hoganjsUtils = _interopRequireDefault(require("./hoganjs-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var defaultDiff2HtmlConfig = __assign(__assign(__assign({}, _lineByLineRenderer.defaultLineByLineRendererConfig), _sideBySideRenderer.defaultSideBySideRendererConfig), {
  outputFormat: _types.OutputFormatType.LINE_BY_LINE,
  drawFileList: true
});

exports.defaultDiff2HtmlConfig = defaultDiff2HtmlConfig;

function parse(diffInput, configuration) {
  if (configuration === void 0) {
    configuration = {};
  }

  return DiffParser.parse(diffInput, __assign(__assign({}, defaultDiff2HtmlConfig), configuration));
}

function html(diffInput, configuration) {
  if (configuration === void 0) {
    configuration = {};
  }

  var config = __assign(__assign({}, defaultDiff2HtmlConfig), configuration);

  var diffJson = typeof diffInput === 'string' ? DiffParser.parse(diffInput, config) : diffInput;
  var hoganUtils = new _hoganjsUtils.default(config);
  var fileList = config.drawFileList ? fileListPrinter.render(diffJson, hoganUtils) : '';
  var diffOutput = config.outputFormat === 'side-by-side' ? new _sideBySideRenderer.default(hoganUtils, config).render(diffJson) : new _lineByLineRenderer.default(hoganUtils, config).render(diffJson);
  return fileList + diffOutput;
}
},{"./diff-parser":"../node_modules/diff2html/lib-esm/diff-parser.js","./file-list-renderer":"../node_modules/diff2html/lib-esm/file-list-renderer.js","./line-by-line-renderer":"../node_modules/diff2html/lib-esm/line-by-line-renderer.js","./side-by-side-renderer":"../node_modules/diff2html/lib-esm/side-by-side-renderer.js","./types":"../node_modules/diff2html/lib-esm/types.js","./hoganjs-utils":"../node_modules/diff2html/lib-esm/hoganjs-utils.js"}],"../node_modules/prismjs/prism.js":[function(require,module,exports) {
var global = arguments[3];

/* **********************************************
     Begin prism-core.js
********************************************** */

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function (_self){

// Private helper vars
var lang = /\blang(?:uage)?-([\w-]+)\b/i;
var uniqueId = 0;


var _ = {
	manual: _self.Prism && _self.Prism.manual,
	disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,
	util: {
		encode: function encode(tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, encode(tokens.content), tokens.alias);
			} else if (Array.isArray(tokens)) {
				return tokens.map(encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).slice(8, -1);
		},

		objId: function (obj) {
			if (!obj['__id']) {
				Object.defineProperty(obj, '__id', { value: ++uniqueId });
			}
			return obj['__id'];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function deepClone(o, visited) {
			var clone, id, type = _.util.type(o);
			visited = visited || {};

			switch (type) {
				case 'Object':
					id = _.util.objId(o);
					if (visited[id]) {
						return visited[id];
					}
					clone = {};
					visited[id] = clone;

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = deepClone(o[key], visited);
						}
					}

					return clone;

				case 'Array':
					id = _.util.objId(o);
					if (visited[id]) {
						return visited[id];
					}
					clone = [];
					visited[id] = clone;

					o.forEach(function (v, i) {
						clone[i] = deepClone(v, visited);
					});

					return clone;

				default:
					return o;
			}
		},

		/**
		 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
		 *
		 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
		 *
		 * @param {Element} element
		 * @returns {string}
		 */
		getLanguage: function (element) {
			while (element && !lang.test(element.className)) {
				element = element.parentElement;
			}
			if (element) {
				return (element.className.match(lang) || [, 'none'])[1].toLowerCase();
			}
			return 'none';
		},

		/**
		 * Returns the script element that is currently executing.
		 *
		 * This does __not__ work for line script element.
		 *
		 * @returns {HTMLScriptElement | null}
		 */
		currentScript: function () {
			if (typeof document === 'undefined') {
				return null;
			}
			if ('currentScript' in document) {
				return document.currentScript;
			}

			// IE11 workaround
			// we'll get the src of the current script by parsing IE11's error stack trace
			// this will not work for inline scripts

			try {
				throw new Error();
			} catch (err) {
				// Get file src url from stack. Specifically works with the format of stack traces in IE.
				// A stack will look like this:
				//
				// Error
				//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
				//    at Global code (http://localhost/components/prism-core.js:606:1)

				var src = (/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(err.stack) || [])[1];
				if (src) {
					var scripts = document.getElementsByTagName('script');
					for (var i in scripts) {
						if (scripts[i].src == src) {
							return scripts[i];
						}
					}
				}
				return null;
			}
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Insert a token before another token in a language literal
		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
		 * we cannot just provide an object, we need an object and a key.
		 * @param inside The key (or language id) of the parent
		 * @param before The key to insert before.
		 * @param insert Object with the key/value pairs to insert
		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];
			var ret = {};

			for (var token in grammar) {
				if (grammar.hasOwnProperty(token)) {

					if (token == before) {
						for (var newToken in insert) {
							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					// Do not insert token which also occur in insert. See #1525
					if (!insert.hasOwnProperty(token)) {
						ret[token] = grammar[token];
					}
				}
			}

			var old = root[inside];
			root[inside] = ret;

			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === old && key != inside) {
					this[key] = ret;
				}
			});

			return ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function DFS(o, callback, type, visited) {
			visited = visited || {};

			var objId = _.util.objId;

			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					var property = o[i],
					    propertyType = _.util.type(property);

					if (propertyType === 'Object' && !visited[objId(property)]) {
						visited[objId(property)] = true;
						DFS(property, callback, null, visited);
					}
					else if (propertyType === 'Array' && !visited[objId(property)]) {
						visited[objId(property)] = true;
						DFS(property, callback, i, visited);
					}
				}
			}
		}
	},
	plugins: {},

	highlightAll: function(async, callback) {
		_.highlightAllUnder(document, async, callback);
	},

	highlightAllUnder: function(container, async, callback) {
		var env = {
			callback: callback,
			container: container,
			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
		};

		_.hooks.run('before-highlightall', env);

		env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

		_.hooks.run('before-all-elements-highlight', env);

		for (var i = 0, element; element = env.elements[i++];) {
			_.highlightElement(element, async === true, env.callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language = _.util.getLanguage(element);
		var grammar = _.languages[language];

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		var parent = element.parentNode;
		if (parent && parent.nodeName.toLowerCase() === 'pre') {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		function insertHighlightedCode(highlightedCode) {
			env.highlightedCode = highlightedCode;

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
			callback && callback.call(env.element);
		}

		_.hooks.run('before-sanity-check', env);

		if (!env.code) {
			_.hooks.run('complete', env);
			callback && callback.call(env.element);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (!env.grammar) {
			insertHighlightedCode(_.util.encode(env.code));
			return;
		}

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				insertHighlightedCode(evt.data);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
		}
	},

	highlight: function (text, grammar, language) {
		var env = {
			code: text,
			grammar: grammar,
			language: language
		};
		_.hooks.run('before-tokenize', env);
		env.tokens = _.tokenize(env.code, env.grammar);
		_.hooks.run('after-tokenize', env);
		return Token.stringify(_.util.encode(env.tokens), env.language);
	},

	tokenize: function(text, grammar) {
		var rest = grammar.rest;
		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		var tokenList = new LinkedList();
		addAfter(tokenList, tokenList.head, text);

		matchGrammar(text, tokenList, grammar, tokenList.head, 0);

		return toArray(tokenList);
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	},

	Token: Token
};

_self.Prism = _;

function Token(type, content, alias, matchedStr, greedy) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	// Copy of the full string this token was created from
	this.length = (matchedStr || '').length|0;
	this.greedy = !!greedy;
}

Token.stringify = function stringify(o, language) {
	if (typeof o == 'string') {
		return o;
	}
	if (Array.isArray(o)) {
		var s = '';
		o.forEach(function (e) {
			s += stringify(e, language);
		});
		return s;
	}

	var env = {
		type: o.type,
		content: stringify(o.content, language),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language
	};

	var aliases = o.alias;
	if (aliases) {
		if (Array.isArray(aliases)) {
			Array.prototype.push.apply(env.classes, aliases);
		} else {
			env.classes.push(aliases);
		}
	}

	_.hooks.run('wrap', env);

	var attributes = '';
	for (var name in env.attributes) {
		attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
	}

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
};

/**
 * @param {string} text
 * @param {LinkedList<string | Token>} tokenList
 * @param {any} grammar
 * @param {LinkedListNode<string | Token>} startNode
 * @param {number} startPos
 * @param {boolean} [oneshot=false]
 * @param {string} [target]
 */
function matchGrammar(text, tokenList, grammar, startNode, startPos, oneshot, target) {
	for (var token in grammar) {
		if (!grammar.hasOwnProperty(token) || !grammar[token]) {
			continue;
		}

		var patterns = grammar[token];
		patterns = Array.isArray(patterns) ? patterns : [patterns];

		for (var j = 0; j < patterns.length; ++j) {
			if (target && target == token + ',' + j) {
				return;
			}

			var pattern = patterns[j],
				inside = pattern.inside,
				lookbehind = !!pattern.lookbehind,
				greedy = !!pattern.greedy,
				lookbehindLength = 0,
				alias = pattern.alias;

			if (greedy && !pattern.pattern.global) {
				// Without the global flag, lastIndex won't work
				var flags = pattern.pattern.toString().match(/[imsuy]*$/)[0];
				pattern.pattern = RegExp(pattern.pattern.source, flags + 'g');
			}

			pattern = pattern.pattern || pattern;

			for ( // iterate the token list and keep track of the current token/string position
				var currentNode = startNode.next, pos = startPos;
				currentNode !== tokenList.tail;
				pos += currentNode.value.length, currentNode = currentNode.next
			) {

				var str = currentNode.value;

				if (tokenList.length > text.length) {
					// Something went terribly wrong, ABORT, ABORT!
					return;
				}

				if (str instanceof Token) {
					continue;
				}

				var removeCount = 1; // this is the to parameter of removeBetween

				if (greedy && currentNode != tokenList.tail.prev) {
					pattern.lastIndex = pos;
					var match = pattern.exec(text);
					if (!match) {
						break;
					}

					var from = match.index + (lookbehind && match[1] ? match[1].length : 0);
					var to = match.index + match[0].length;
					var p = pos;

					// find the node that contains the match
					p += currentNode.value.length;
					while (from >= p) {
						currentNode = currentNode.next;
						p += currentNode.value.length;
					}
					// adjust pos (and p)
					p -= currentNode.value.length;
					pos = p;

					// the current node is a Token, then the match starts inside another Token, which is invalid
					if (currentNode.value instanceof Token) {
						continue;
					}

					// find the last node which is affected by this match
					for (
						var k = currentNode;
						k !== tokenList.tail && (p < to || (typeof k.value === 'string' && !k.prev.value.greedy));
						k = k.next
					) {
						removeCount++;
						p += k.value.length;
					}
					removeCount--;

					// replace with the new match
					str = text.slice(pos, p);
					match.index -= pos;
				} else {
					pattern.lastIndex = 0;

					var match = pattern.exec(str);
				}

				if (!match) {
					if (oneshot) {
						break;
					}

					continue;
				}

				if (lookbehind) {
					lookbehindLength = match[1] ? match[1].length : 0;
				}

				var from = match.index + lookbehindLength,
					match = match[0].slice(lookbehindLength),
					to = from + match.length,
					before = str.slice(0, from),
					after = str.slice(to);

				var removeFrom = currentNode.prev;

				if (before) {
					removeFrom = addAfter(tokenList, removeFrom, before);
					pos += before.length;
				}

				removeRange(tokenList, removeFrom, removeCount);

				var wrapped = new Token(token, inside ? _.tokenize(match, inside) : match, alias, match, greedy);
				currentNode = addAfter(tokenList, removeFrom, wrapped);

				if (after) {
					addAfter(tokenList, currentNode, after);
				}


				if (removeCount > 1)
					matchGrammar(text, tokenList, grammar, currentNode.prev, pos, true, token + ',' + j);

				if (oneshot)
					break;
			}
		}
	}
}

/**
 * @typedef LinkedListNode
 * @property {T} value
 * @property {LinkedListNode<T> | null} prev The previous node.
 * @property {LinkedListNode<T> | null} next The next node.
 * @template T
 */

/**
 * @template T
 */
function LinkedList() {
	/** @type {LinkedListNode<T>} */
	var head = { value: null, prev: null, next: null };
	/** @type {LinkedListNode<T>} */
	var tail = { value: null, prev: head, next: null };
	head.next = tail;

	/** @type {LinkedListNode<T>} */
	this.head = head;
	/** @type {LinkedListNode<T>} */
	this.tail = tail;
	this.length = 0;
}

/**
 * Adds a new node with the given value to the list.
 * @param {LinkedList<T>} list
 * @param {LinkedListNode<T>} node
 * @param {T} value
 * @returns {LinkedListNode<T>} The added node.
 * @template T
 */
function addAfter(list, node, value) {
	// assumes that node != list.tail && values.length >= 0
	var next = node.next;

	var newNode = { value: value, prev: node, next: next };
	node.next = newNode;
	next.prev = newNode;
	list.length++;

	return newNode;
}
/**
 * Removes `count` nodes after the given node. The given node will not be removed.
 * @param {LinkedList<T>} list
 * @param {LinkedListNode<T>} node
 * @param {number} count
 * @template T
 */
function removeRange(list, node, count) {
	var next = node.next;
	for (var i = 0; i < count && next !== list.tail; i++) {
		next = next.next;
	}
	node.next = next;
	next.prev = node;
	list.length -= i;
}
/**
 * @param {LinkedList<T>} list
 * @returns {T[]}
 * @template T
 */
function toArray(list) {
	var array = [];
	var node = list.head.next;
	while (node !== list.tail) {
		array.push(node.value);
		node = node.next;
	}
	return array;
}


if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _;
	}

	if (!_.disableWorkerMessageHandler) {
		// In worker
		_self.addEventListener('message', function (evt) {
			var message = JSON.parse(evt.data),
				lang = message.language,
				code = message.code,
				immediateClose = message.immediateClose;

			_self.postMessage(_.highlight(code, _.languages[lang], lang));
			if (immediateClose) {
				_self.close();
			}
		}, false);
	}

	return _;
}

//Get current script and highlight
var script = _.util.currentScript();

if (script) {
	_.filename = script.src;

	if (script.hasAttribute('data-manual')) {
		_.manual = true;
	}
}

function highlightAutomaticallyCallback() {
	if (!_.manual) {
		_.highlightAll();
	}
}

if (!_.manual) {
	// If the document state is "loading", then we'll use DOMContentLoaded.
	// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
	// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
	// might take longer one animation frame to execute which can create a race condition where only some plugins have
	// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
	// See https://github.com/PrismJS/prism/issues/2102
	var readyState = document.readyState;
	if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
		document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
	} else {
		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(highlightAutomaticallyCallback);
		} else {
			window.setTimeout(highlightAutomaticallyCallback, 16);
		}
	}
}

return _;

})(_self);

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\s\S]*?-->/,
	'prolog': /<\?[\s\S]+?\?>/,
	'doctype': {
		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:(?!<!--)[^"'\]]|"[^"]*"|'[^']*'|<!--[\s\S]*?-->)*\]\s*)?>/i,
		greedy: true
	},
	'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/i,
		greedy: true,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
				inside: {
					'punctuation': [
						/^=/,
						{
							pattern: /^(\s*)["']|["']$/,
							lookbehind: true
						}
					]
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
	Prism.languages.markup['entity'];

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
	/**
	 * Adds an inlined language to markup.
	 *
	 * An example of an inlined language is CSS with `<style>` tags.
	 *
	 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
	 * case insensitive.
	 * @param {string} lang The language key.
	 * @example
	 * addInlined('style', 'css');
	 */
	value: function addInlined(tagName, lang) {
		var includedCdataInside = {};
		includedCdataInside['language-' + lang] = {
			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
			lookbehind: true,
			inside: Prism.languages[lang]
		};
		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

		var inside = {
			'included-cdata': {
				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
				inside: includedCdataInside
			}
		};
		inside['language-' + lang] = {
			pattern: /[\s\S]+/,
			inside: Prism.languages[lang]
		};

		var def = {};
		def[tagName] = {
			pattern: RegExp(/(<__[\s\S]*?>)(?:<!\[CDATA\[[\s\S]*?\]\]>\s*|[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
			lookbehind: true,
			greedy: true,
			inside: inside
		};

		Prism.languages.insertBefore('markup', 'cdata', def);
	}
});

Prism.languages.xml = Prism.languages.extend('markup', {});
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;


/* **********************************************
     Begin prism-css.js
********************************************** */

(function (Prism) {

	var string = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;

	Prism.languages.css = {
		'comment': /\/\*[\s\S]*?\*\//,
		'atrule': {
			pattern: /@[\w-]+[\s\S]*?(?:;|(?=\s*\{))/,
			inside: {
				'rule': /^@[\w-]+/,
				'selector-function-argument': {
					pattern: /(\bselector\s*\((?!\s*\))\s*)(?:[^()]|\((?:[^()]|\([^()]*\))*\))+?(?=\s*\))/,
					lookbehind: true,
					alias: 'selector'
				}
				// See rest below
			}
		},
		'url': {
			pattern: RegExp('url\\((?:' + string.source + '|[^\n\r()]*)\\)', 'i'),
			greedy: true,
			inside: {
				'function': /^url/i,
				'punctuation': /^\(|\)$/
			}
		},
		'selector': RegExp('[^{}\\s](?:[^{};"\']|' + string.source + ')*?(?=\\s*\\{)'),
		'string': {
			pattern: string,
			greedy: true
		},
		'property': /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
		'important': /!important\b/i,
		'function': /[-a-z0-9]+(?=\()/i,
		'punctuation': /[(){};:,]/
	};

	Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

	var markup = Prism.languages.markup;
	if (markup) {
		markup.tag.addInlined('style', 'css');

		Prism.languages.insertBefore('inside', 'attr-value', {
			'style-attr': {
				pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
				inside: {
					'attr-name': {
						pattern: /^\s*style/i,
						inside: markup.tag.inside
					},
					'punctuation': /^\s*=\s*['"]|['"]\s*$/,
					'attr-value': {
						pattern: /.+/i,
						inside: Prism.languages.css
					}
				},
				alias: 'language-css'
			}
		}, markup.tag);
	}

}(Prism));


/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true,
			greedy: true
		}
	],
	'string': {
		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
		lookbehind: true,
		inside: {
			'punctuation': /[.\\]/
		}
	},
	'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(?:true|false)\b/,
	'function': /\w+(?=\()/,
	'number': /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'class-name': [
		Prism.languages.clike['class-name'],
		{
			pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,
			lookbehind: true
		}
	],
	'keyword': [
		{
			pattern: /((?:^|})\s*)(?:catch|finally)\b/,
			lookbehind: true
		},
		{
			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
			lookbehind: true
		},
	],
	'number': /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
	'operator': /--|\+\+|\*\*=?|=>|&&|\|\||[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?[.?]?|[~:]/
});

Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*[\s\S]*?\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,
		lookbehind: true,
		greedy: true
	},
	// This must be declared before keyword because we use "function" inside the look-forward
	'function-variable': {
		pattern: /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,
		alias: 'function'
	},
	'parameter': [
		{
			pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,
			inside: Prism.languages.javascript
		},
		{
			pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		}
	],
	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,
		greedy: true,
		inside: {
			'template-punctuation': {
				pattern: /^`|`$/,
				alias: 'string'
			},
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,
				lookbehind: true,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\${|}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.markup.tag.addInlined('script', 'javascript');
}

Prism.languages.js = Prism.languages.javascript;


/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
		return;
	}

	/**
	 * @param {Element} [container=document]
	 */
	self.Prism.fileHighlight = function(container) {
		container = container || document;

		var Extensions = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		Array.prototype.slice.call(container.querySelectorAll('pre[data-src]')).forEach(function (pre) {
			// ignore if already loaded
			if (pre.hasAttribute('data-src-loaded')) {
				return;
			}

			// load current
			var src = pre.getAttribute('data-src');

			var language, parent = pre;
			var lang = /\blang(?:uage)?-([\w-]+)\b/i;
			while (parent && !lang.test(parent.className)) {
				parent = parent.parentNode;
			}

			if (parent) {
				language = (pre.className.match(lang) || [, ''])[1];
			}

			if (!language) {
				var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
				language = Extensions[extension] || extension;
			}

			var code = document.createElement('code');
			code.className = 'language-' + language;

			pre.textContent = '';

			code.textContent = 'Loading…';

			pre.appendChild(code);

			var xhr = new XMLHttpRequest();

			xhr.open('GET', src, true);

			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {

					if (xhr.status < 400 && xhr.responseText) {
						code.textContent = xhr.responseText;

						Prism.highlightElement(code);
						// mark as loaded
						pre.setAttribute('data-src-loaded', '');
					}
					else if (xhr.status >= 400) {
						code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
					}
					else {
						code.textContent = '✖ Error: File does not exist or is empty';
					}
				}
			};

			xhr.send(null);
		});
	};

	document.addEventListener('DOMContentLoaded', function () {
		// execute inside handler, for dropping Event as argument
		self.Prism.fileHighlight();
	});

})();

},{}],"../node_modules/prismjs/components/prism-go.js":[function(require,module,exports) {
Prism.languages.go = Prism.languages.extend('clike', {
	'keyword': /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(?:to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,
	'builtin': /\b(?:bool|byte|complex(?:64|128)|error|float(?:32|64)|rune|string|u?int(?:8|16|32|64)?|uintptr|append|cap|close|complex|copy|delete|imag|len|make|new|panic|print(?:ln)?|real|recover)\b/,
	'boolean': /\b(?:_|iota|nil|true|false)\b/,
	'operator': /[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./,
	'number': /(?:\b0x[a-f\d]+|(?:\b\d+\.?\d*|\B\.\d+)(?:e[-+]?\d+)?)i?/i,
	'string': {
		pattern: /(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1/,
		greedy: true
	}
});
delete Prism.languages.go['class-name'];

},{}],"../node_modules/prismjs/components/prism-java.js":[function(require,module,exports) {
(function (Prism) {

	var keywords = /\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|exports|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|module|native|new|null|open|opens|package|private|protected|provides|public|record|requires|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|to|transient|transitive|try|uses|var|void|volatile|while|with|yield)\b/;

	// based on the java naming conventions
	var className = /\b[A-Z](?:\w*[a-z]\w*)?\b/;

	Prism.languages.java = Prism.languages.extend('clike', {
		'class-name': [
			className,

			// variables and parameters
			// this to support class names (or generic parameters) which do not contain a lower case letter (also works for methods)
			/\b[A-Z]\w*(?=\s+\w+\s*[;,=())])/
		],
		'keyword': keywords,
		'function': [
			Prism.languages.clike.function,
			{
				pattern: /(\:\:)[a-z_]\w*/,
				lookbehind: true
			}
		],
		'number': /\b0b[01][01_]*L?\b|\b0x[\da-f_]*\.?[\da-f_p+-]+\b|(?:\b\d[\d_]*\.?[\d_]*|\B\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?[dfl]?/i,
		'operator': {
			pattern: /(^|[^.])(?:<<=?|>>>?=?|->|--|\+\+|&&|\|\||::|[?:~]|[-+*/%&|^!=<>]=?)/m,
			lookbehind: true
		}
	});

	Prism.languages.insertBefore('java', 'string', {
		'triple-quoted-string': {
			// http://openjdk.java.net/jeps/355#Description
			pattern: /"""[ \t]*[\r\n](?:(?:"|"")?(?:\\.|[^"\\]))*"""/,
			greedy: true,
			alias: 'string'
		}
	});

	Prism.languages.insertBefore('java', 'class-name', {
		'annotation': {
			alias: 'punctuation',
			pattern: /(^|[^.])@\w+/,
			lookbehind: true
		},
		'namespace': {
			pattern: /(\b(?:exports|import(?:\s+static)?|module|open|opens|package|provides|requires|to|transitive|uses|with)\s+)[a-z]\w*(?:\.[a-z]\w*)+/,
			lookbehind: true,
			inside: {
				'punctuation': /\./,
			}
		},
		'generics': {
			pattern: /<(?:[\w\s,.&?]|<(?:[\w\s,.&?]|<(?:[\w\s,.&?]|<[\w\s,.&?]*>)*>)*>)*>/,
			inside: {
				'class-name': className,
				'keyword': keywords,
				'punctuation': /[<>(),.:]/,
				'operator': /[?&|]/
			}
		}
	});
}(Prism));

},{}],"../node_modules/prismjs/components/prism-c.js":[function(require,module,exports) {
Prism.languages.c = Prism.languages.extend('clike', {
	'comment': {
		pattern: /\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/,
		greedy: true
	},
	'class-name': {
		pattern: /(\b(?:enum|struct)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+/,
		lookbehind: true
	},
	'keyword': /\b(?:__attribute__|_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)\b/,
	'function': /[a-z_]\w*(?=\s*\()/i,
	'operator': />>=?|<<=?|->|([-+&|:])\1|[?:~]|[-+*/%&|^!=<>]=?/,
	'number': /(?:\b0x(?:[\da-f]+\.?[\da-f]*|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?)[ful]*/i
});

Prism.languages.insertBefore('c', 'string', {
	'macro': {
		// allow for multiline macro definitions
		// spaces after the # character compile fine with gcc
		pattern: /(^\s*)#\s*[a-z]+(?:[^\r\n\\]|\\(?:\r\n|[\s\S]))*/im,
		lookbehind: true,
		alias: 'property',
		inside: {
			// highlight the path of the include statement as a string
			'string': {
				pattern: /(#\s*include\s*)(?:<.+?>|("|')(?:\\?.)+?\2)/,
				lookbehind: true
			},
			// highlight macro directives as keywords
			'directive': {
				pattern: /(#\s*)\b(?:define|defined|elif|else|endif|error|ifdef|ifndef|if|import|include|line|pragma|undef|using)\b/,
				lookbehind: true,
				alias: 'keyword'
			}
		}
	},
	// highlight predefined macros as constants
	'constant': /\b(?:__FILE__|__LINE__|__DATE__|__TIME__|__TIMESTAMP__|__func__|EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|stdin|stdout|stderr)\b/
});

delete Prism.languages.c['boolean'];

},{}],"../node_modules/prismjs/components/prism-javascript.js":[function(require,module,exports) {
Prism.languages.javascript = Prism.languages.extend('clike', {
	'class-name': [
		Prism.languages.clike['class-name'],
		{
			pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,
			lookbehind: true
		}
	],
	'keyword': [
		{
			pattern: /((?:^|})\s*)(?:catch|finally)\b/,
			lookbehind: true
		},
		{
			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
			lookbehind: true
		},
	],
	'number': /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
	'operator': /--|\+\+|\*\*=?|=>|&&|\|\||[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?[.?]?|[~:]/
});

Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*[\s\S]*?\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,
		lookbehind: true,
		greedy: true
	},
	// This must be declared before keyword because we use "function" inside the look-forward
	'function-variable': {
		pattern: /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,
		alias: 'function'
	},
	'parameter': [
		{
			pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,
			inside: Prism.languages.javascript
		},
		{
			pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		}
	],
	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,
		greedy: true,
		inside: {
			'template-punctuation': {
				pattern: /^`|`$/,
				alias: 'string'
			},
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,
				lookbehind: true,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\${|}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.markup.tag.addInlined('script', 'javascript');
}

Prism.languages.js = Prism.languages.javascript;

},{}],"../node_modules/prismjs/components/prism-clike.js":[function(require,module,exports) {
Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true,
			greedy: true
		}
	],
	'string': {
		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
		lookbehind: true,
		inside: {
			'punctuation': /[.\\]/
		}
	},
	'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(?:true|false)\b/,
	'function': /\w+(?=\()/,
	'number': /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
	'punctuation': /[{}[\];(),.:]/
};

},{}],"content-script.js":[function(require,module,exports) {
"use strict";

var diff2Html = _interopRequireWildcard(require("diff2html"));

var Prism = _interopRequireWildcard(require("prismjs"));

require("prismjs/components/prism-go");

require("prismjs/components/prism-java");

require("prismjs/components/prism-c");

require("prismjs/components/prism-javascript");

require("prismjs/components/prism-clike");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// language highlight
var ENV = "production"; // const ENV = "development";

var LEFT_SIDE = "left";
var RIGHT_SIDE = "right";
var fileMap = {};
var popup = document.createElement("div");

var debug = function debug(value) {
  if (ENV !== "development") {
    return;
  }

  console.log(value);
};
/**
 * Update global file map after url change
 */


var updateFileMap = function updateFileMap() {
  var changed = false;
  document.querySelectorAll(".file").forEach(function (file) {
    var header = file.querySelector(".file-info > a");
    var fileName = header.textContent;
    var link = header.getAttribute("href");

    if (!fileMap[fileName]) {
      changed = true;
    }

    fileMap[fileName] = {
      ref: file,
      link: link
    };
  });
  return changed;
};
/**
 * Register an event in analytics
 * @param {String} category
 * @param {String} action
 */


var sendEvent = function sendEvent(category, action, label, value) {
  debug({
    category: category,
    action: action,
    label: label,
    value: value
  });

  try {
    chrome.runtime.sendMessage({
      command: "event",
      category: category,
      action: action,
      label: label,
      value: value
    });
  } catch (e) {
    console.error(e);
  }
};
/**
 * Message receiver to handle data
 */


chrome.runtime.onMessage.addListener(function (request) {
  switch (request.command) {
    case "refdiff-refactoring":
      // check if diff files are loaded and changed
      if (!updateFileMap()) {
        debug("no new files");
      } // no refactorings found


      if (!request.data || !request.data.refactorings) {
        return;
      }

      debug("Loading: " + request.data.refactorings.length + " refactorings");
      request.data.refactorings.forEach(function (refactoring) {
        addRefactorings(fileMap, refactoring, LEFT_SIDE);
        addRefactorings(fileMap, refactoring, RIGHT_SIDE);
      });
  }
});
var debounceObserver = null;
var debounceObserverTimeout = 100;
/**
 * Initialize observers to trigger plugin update
 * @param {Array} selectors list of CSS selectors to observe
 */

var initObserver = function initObserver(selectors) {
  var observer = new MutationObserver(function (mutationsList) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = mutationsList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var mutation = _step.value;

        if (mutation.type === "childList") {
          clearTimeout(debounceObserver);
          debounceObserver = setTimeout(function () {
            if (!updateFileMap() && document.querySelector(".btn-refector")) {
              debug("Files without change");
              return;
            } // request data from firebase


            chrome.runtime.sendMessage({
              command: "refdiff-refactoring",
              url: document.location.href.split("#diff")[0]
            });
          }, debounceObserverTimeout);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });
  selectors.forEach(function (selector) {
    var targetNode = document.querySelector(selector);
    observer.observe(targetNode, {
      attributes: false,
      childList: true,
      subtree: true
    });
  });
};
/**
 * Plugin initialization after page load
 */


window.addEventListener("load", function () {
  initObserver(["#js-repo-pjax-container"]);
  popup.setAttribute("class", "diff-refector-popup");
  popup.innerHTML = "\n        <button class=\"diff-refector-action diff-refector-popup-close btn btn-sm btn-default\">x</button>\n        <button class=\"diff-refector-action diff-refector-popup-maximize btn btn-sm btn-default\">\u26F6</button>\n        <p><b class=\"refactor-type\"></b></p>\n        <div class=\"refactor-content\"></div>\n        <div class=\"refactor-diff-code\"></div>\n        <div class=\"d2h-wrapper refactor-diff-extration-wrapper\">\n            <div class=\"d2h-file-wrapper\">\n                <div class=\"d2h-file-header\">\n                    <span class=\"d2h-file-name-wrapper\">\n                        <svg aria-hidden=\"true\" class=\"d2h-icon\" height=\"16\" version=\"1.1\" viewBox=\"0 0 12 16\" width=\"12\">\n                            <path d=\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\"></path>\n                        </svg>\n                        <span class=\"d2h-file-name refactor-diff-extraction-name\"></span>\n                        <span class=\"d2h-tag d2h-moved d2h-extracted-tag\">EXTRACT</span>\n                    </span>\n                </div>\n                <div class=\"refactor-diff-extraction\"></div>\n            </div>\n        </div>\n        <a class=\"btn btn-sm btn-primary refactor-link\" href=\"#\">Go to source</a>\n    ";

  popup.show = function (element, type, contentHTML, link, buttonText, side, diff) {
    popup.querySelector(".refactor-content").innerHTML = contentHTML;
    popup.querySelector(".refactor-type").innerText = type;
    popup.querySelector(".refactor-diff-code").innerHTML = diff.code || "";
    popup.querySelector(".refactor-diff-extraction").innerHTML = diff.extraction ? "<pre><code class=\"language-java\">".concat(diff.extraction, "</code></pre>") : "";

    if (diff.extraction) {
      popup.querySelector(".refactor-diff-extration-wrapper").style.setProperty("display", "block");
      popup.querySelector(".refactor-diff-extraction-name").innerText = diff.filename;
    } else {
      popup.querySelector(".refactor-diff-extration-wrapper").style.setProperty("display", "none");
    }

    if (link) {
      var button = popup.querySelector(".refactor-link");
      button.setAttribute("href", link);
      button.textContent = buttonText;
      button.addEventListener("click", function () {
        sendEvent("click", "goto-side", side);
        sendEvent("click", "goto-type", type);
      });
    }

    popup.style.setProperty("display", "block");
    popup.style.setProperty("right", "auto");
    popup.style.setProperty("left", "auto"); // pop-up offset to align box in left side

    var offset = popup.getBoundingClientRect().width + 10;
    var bounds = element.getBoundingClientRect();
    var left = (window.pageXOffset || element.scrollLeft) + bounds.left;
    var top = (window.pageYOffset || element.scrollTop) + bounds.top; // check if exists another open modal with unfinished time

    var lastTime = popup.getAttribute("data-time");

    if (lastTime) {
      var duration = Math.round((+new Date() - lastTime) / 100);
      sendEvent("duration", "type", type, duration);
      sendEvent("duration", "side", side, duration);
    }

    popup.style.setProperty("top", top + "px");
    popup.style.setProperty("left", Math.max(15, left - offset) + "px");
    popup.setAttribute("data-time", +new Date());
    popup.setAttribute("data-type", type);
    popup.setAttribute("data-side", side);
    popup.removeAttribute("data-left");
    popup.removeAttribute("data-right");
    sendEvent("click", "type", type);
    sendEvent("click", "side", side);
  };

  document.body.appendChild(popup);
  popup.querySelector(".diff-refector-popup-close").addEventListener("click", function () {
    var type = popup.getAttribute("data-type");
    var side = popup.getAttribute("data-side");
    var openTime = Number(popup.getAttribute("data-time"));
    var duration = Math.round((+new Date() - openTime) / 100);
    popup.removeAttribute("data-time");
    popup.style.setProperty("display", "none");
    sendEvent("duration", "type", type, duration);
    sendEvent("duration", "side", side, duration);
  });
  popup.querySelector(".diff-refector-popup-maximize").addEventListener("click", function () {
    var left = popup.getAttribute("data-left");
    var right = popup.getAttribute("data-right");

    if (left || right) {
      popup.style.setProperty("left", left);
      popup.style.setProperty("right", right);
      popup.removeAttribute("data-left");
      popup.removeAttribute("data-right");
    } else {
      popup.setAttribute("data-left", popup.style.getPropertyValue("left"));
      popup.setAttribute("data-right", popup.style.getPropertyValue("right"));
      popup.style.setProperty("left", "15px");
      popup.style.setProperty("right", "15px");
    }

    sendEvent("click", "maximize", popup.getAttribute("data-type"));
  });
});
/**
 *
 * @param {Object} fileMap pair of file and page anchor
 * @param {Object} refactoring refactoring data
 * @param {LEFT_SIDE|RIGHT_SIDE} side diff side
 */

var addRefactorings = function addRefactorings(fileMap, refactoring, side) {
  debug(side);
  debug(refactoring);
  var diff = {};

  if (refactoring.diff) {
    var afterFileName = refactoring.extraction ? refactoring.before_file_name : refactoring.after_file_name;
    diff.code = diff2Html.html("--- a/".concat(refactoring.before_file_name, "\n+++ b/").concat(afterFileName, "\n").concat(refactoring.diff), {
      drawFileList: false,
      outputFormat: "side-by-side"
    });
  }

  if (refactoring.extraction) {
    diff.filename = refactoring.after_file_name;
    diff.extraction = Prism.highlight(refactoring.extraction, Prism.languages[refactoring.language || "clike"], refactoring.language || "clike");
  }

  var beforeFile = fileMap[refactoring.before_file_name];
  var afterFile = fileMap[refactoring.after_file_name];

  if (!beforeFile || !afterFile) {
    return;
  } // right side (addiction)


  var lineNumber = refactoring.after_line_number;
  var buttonText = "Go to source";
  var baseFile = afterFile.ref;
  var link = "".concat(beforeFile.link, "L").concat(refactoring.before_line_number);
  var selectorLineSufix = ".blob-num-addition"; // left side (deletion)

  if (side === LEFT_SIDE) {
    lineNumber = refactoring.before_line_number;
    buttonText = "Go to target";
    baseFile = beforeFile.ref;
    link = "".concat(afterFile.link, "R").concat(refactoring.after_line_number);
    selectorLineSufix = ".blob-num-deletion";
  }

  var iterator = function iterator(selectorLineSufix) {
    return function (line) {
      if (!line.querySelector("[data-line-number=\"".concat(lineNumber, "\"]").concat(selectorLineSufix))) {
        return false;
      } // avoid duplication, skip if found an anotation


      if (line.querySelector("[data-line-number=\"".concat(lineNumber, "\"]").concat(selectorLineSufix, "~.blob-code .btn-refector"))) {
        return true;
      }

      var contentHTML;
      var title = "".concat(refactoring.type.replace("_", " "), " ").concat(refactoring.object_type);

      switch (refactoring.type) {
        case "RENAME":
          contentHTML = "<p><code>".concat(refactoring.before_local_name, "</code> renamed to <code>").concat(refactoring.after_local_name, "</code></p>");
          break;

        case "CHANGE_SIGNATURE":
          contentHTML = "<p>Signature changed.</p>";
          contentHTML += "<p>Before: <code>".concat(refactoring.before_local_name, "</code></p>");
          contentHTML += "<p>After: <code>".concat(refactoring.after_local_name, "</code></p>");
          break;

        case "MOVE":
        case "INTERNAL_MOVE":
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
        case "EXTRACT_MOVE":
          contentHTML = "<p>".concat(refactoring.object_type.toLowerCase(), " <code>").concat(refactoring.after_local_name, "</code> extracted from <code>").concat(refactoring.object_type.toLowerCase(), " ").concat(refactoring.before_local_name, "</code>.</p>");
          contentHTML += "<p>Source: <code>".concat(refactoring.before_file_name, ":").concat(refactoring.before_line_number, "</code></p>");
          contentHTML += "<p>Target: <code>".concat(refactoring.after_file_name, ":").concat(refactoring.after_line_number, "</code></p>");
          break;

        case "INLINE":
          contentHTML = "<p>Inline function <code>".concat(refactoring.object_type.toLowerCase(), " ").concat(refactoring.before_local_name, "</code> in <code> ").concat(refactoring.after_local_name, "</code>.</p>");
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
      button.setAttribute("class", "btn-refector ".concat(side === LEFT_SIDE ? "btn-refactor-left" : "btn-refactor-right"));
      button.addEventListener("click", function () {
        popup.show(button, title, contentHTML, link, buttonText, side, diff);
      });
      button.innerText = "R";
      var sel = "[data-line-number=\"".concat(lineNumber, "\"]").concat(selectorLineSufix, "~.blob-code");
      var sides = line.querySelectorAll(sel);

      if (side == LEFT_SIDE) {
        sides[0].appendChild(button);
      } else {
        sides[sides.length - 1].appendChild(button);
      }

      return true;
    };
  };

  var found = Array.from(baseFile.querySelectorAll(".diff-table tr")).some(iterator(selectorLineSufix)); // fallback for lines without marks of addiction / deletion

  if (!found) {
    Array.from(baseFile.querySelectorAll(".diff-table tr")).some(iterator(".blob-num-context"));
  }
};
},{"diff2html":"../node_modules/diff2html/lib-esm/diff2html.js","prismjs":"../node_modules/prismjs/prism.js","prismjs/components/prism-go":"../node_modules/prismjs/components/prism-go.js","prismjs/components/prism-java":"../node_modules/prismjs/components/prism-java.js","prismjs/components/prism-c":"../node_modules/prismjs/components/prism-c.js","prismjs/components/prism-javascript":"../node_modules/prismjs/components/prism-javascript.js","prismjs/components/prism-clike":"../node_modules/prismjs/components/prism-clike.js"}]},{},["content-script.js"], null)