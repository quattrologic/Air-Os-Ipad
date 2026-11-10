'use strict';

const path = require('node:path');

// Standalone browser tests can read pinned fixtures from an isolated Git checkout.
function testHistory(root) {
  return path.resolve(process.env.AIR_PAD_TEST_HISTORY || root);
}

module.exports = {testHistory};
