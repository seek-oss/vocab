'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./vocab-webpack.cjs.prod.js");
} else {
  module.exports = require("./vocab-webpack.cjs.dev.js");
}
