'use strict';

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = o[Symbol.iterator]();
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

/* eslint-disable @typescript-eslint/no-var-requires */
var path = require('path');

var glob = require('fast-glob');

var defaultLanguage = 'en';
var altLanguages = ['th'];
var translationDirname = '__translations__';

function getDefaultLanguage() {
  return defaultLanguage;
}

function getAltLanguages() {
  return altLanguages;
}

function getChunkName(lang) {
  return "".concat(lang, "-translations");
}

function getAltLanguageFilePath(filePath, language) {
  var directory = path.dirname(filePath);

  var _path$basename$split = path.basename(filePath).split('.translations.json'),
      _path$basename$split2 = _slicedToArray(_path$basename$split, 1),
      fileIdentifier = _path$basename$split2[0];

  return path.join(directory, translationDirname, "".concat(fileIdentifier, ".translations.").concat(language, ".json"));
}

function getAllTranslationFiles() {
  return _getAllTranslationFiles.apply(this, arguments);
}

function _getAllTranslationFiles() {
  _getAllTranslationFiles = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var translationFiles;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return glob('**/*.translations.json');

          case 2:
            translationFiles = _context.sent;
            return _context.abrupt("return", translationFiles);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getAllTranslationFiles.apply(this, arguments);
}

function loadTranslation(filePath) {
  var languages = new Map();
  languages.set(defaultLanguage, require(filePath));

  var _iterator = _createForOfIteratorHelper(altLanguages),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var lang = _step.value;

      try {
        languages.set(lang, require(getAltLanguageFilePath(filePath, lang)));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Ignore missing alt-language file', getAltLanguageFilePath(filePath, lang));
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return {
    filePath: filePath,
    languages: languages
  };
}

function loadAllTranslations() {
  return _loadAllTranslations.apply(this, arguments);
}

function _loadAllTranslations() {
  _loadAllTranslations = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var translationFiles;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return glob('**/*.translations.json', {
              absolute: true
            });

          case 2:
            translationFiles = _context2.sent;
            return _context2.abrupt("return", translationFiles.map(loadTranslation));

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _loadAllTranslations.apply(this, arguments);
}

function getTranslationKeys(translation) {
  return Object.keys(translation.languages.get(getDefaultLanguage()));
}

module.exports = {
  loadAllTranslations: loadAllTranslations,
  getAltLanguageFilePath: getAltLanguageFilePath,
  getAllTranslationFiles: getAllTranslationFiles,
  loadTranslation: loadTranslation,
  getChunkName: getChunkName,
  getDefaultLanguage: getDefaultLanguage,
  getAltLanguages: getAltLanguages,
  getTranslationKeys: getTranslationKeys
};
