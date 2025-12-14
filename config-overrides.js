// config-overrides.js
const path = require('path');

module.exports = function override(config, env) {
  // Add a fallback for the old 'react-query' package name
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query'),
  };
  return config;
};
