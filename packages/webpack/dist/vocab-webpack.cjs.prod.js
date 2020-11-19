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

/* eslint-disable no-console */
var _require = require('@vocab/utils'),
    getAltLanguageFilePath = _require.getAltLanguageFilePath,
    getChunkName = _require.getChunkName,
    getDefaultLanguage = _require.getDefaultLanguage,
    getAltLanguages = _require.getAltLanguages;

function renderLanguageLoaderAsync(_ref) {
  var lang = _ref.lang,
      filePath = _ref.filePath,
      _ref$useJsonLoader = _ref.useJsonLoader,
      useJsonLoader = _ref$useJsonLoader === void 0 ? false : _ref$useJsonLoader;
  var identifier = "!!".concat(useJsonLoader ? 'json-loader!' : '').concat(filePath);
  return "".concat(lang, ": createLanguage(require.resolveWeak('").concat(identifier, "'), () => import(\n      /* webpackChunkName: \"").concat(getChunkName(lang), "\" */\n      '").concat(identifier, "'\n    ), '").concat(lang, "')");
}

function renderLanguageLoaderSync(_ref2) {
  var lang = _ref2.lang,
      filePath = _ref2.filePath,
      _ref2$useJsonLoader = _ref2.useJsonLoader,
      useJsonLoader = _ref2$useJsonLoader === void 0 ? false : _ref2$useJsonLoader;
  return "".concat(lang, ": createLanguage(require('!!").concat(useJsonLoader ? 'json-loader!' : '').concat(filePath, "'), '").concat(lang, "')");
}

module.exports = function loader() {
  var _this = this;

  console.log('Loading', this.target, this.resourcePath);
  var altLanguageFiles = getAltLanguages().map(function (lang) {
    return {
      filePath: getAltLanguageFilePath(_this.resourcePath, lang),
      lang: lang
    };
  });

  var _iterator = _createForOfIteratorHelper(altLanguageFiles),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var altLanguageFile = _step.value;
      this.addDependency(altLanguageFile.filePath);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var target = this.target;
  var renderLanguageLoader = target === 'web' ? renderLanguageLoaderAsync : renderLanguageLoaderSync;
  var result = "\n    import { createLanguage } from '@vocab/webpack/runtime/".concat(target, "';\n\n    export default {\n      __DO_NOT_USE__: {\n        ").concat(renderLanguageLoader({
    lang: getDefaultLanguage(),
    filePath: this.resourcePath,
    useJsonLoader: true
  }), ",\n        ").concat(altLanguageFiles.map(function (altLanguageFile) {
    return renderLanguageLoader(altLanguageFile);
  }).join(','), "\n      }\n    };\n  ");
  return result;
};
