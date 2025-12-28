const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable Hermes
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true, // Preserve class names for better debugging
    keep_fnames: true, // Preserve function names for better debugging
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// Add source extensions if needed
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'jsx', 'js', 'ts', 'tsx', 'json'],
};

module.exports = config;
