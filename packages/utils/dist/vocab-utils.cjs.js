'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./vocab-utils.cjs.prod.js");
} else {
  module.exports = require("./vocab-utils.cjs.dev.js");
}
