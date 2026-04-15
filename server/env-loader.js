// env-loader.js
// This CommonJS file is preloaded via --require BEFORE any ES module imports run.
// It ensures process.env is populated before passport.js, env-check.js etc. load.
require("dotenv").config();
