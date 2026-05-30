// NestJS webpack build override. The @dewasa-ayu/* workspace packages ship raw TS
// source (no prebuilt dist), so they must be BUNDLED (compiled by ts-loader) rather
// than externalized — otherwise `node dist/main.js` would try to require a `.ts` file.
// Everything else in node_modules stays external (normal Node resolution).
const nodeExternals = require('webpack-node-externals');

module.exports = (options) => ({
  ...options,
  externals: [
    nodeExternals({
      allowlist: [/^@dewasa-ayu\//],
    }),
  ],
});
