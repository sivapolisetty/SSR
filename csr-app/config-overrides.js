const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = function override(config, env) {
  config.mode = "development";
  
  config.plugins.push(
    new ModuleFederationPlugin({
      name: "csr_app",
      remotes: {
        ssr_app: "ssr_app@http://localhost:3002/_next/static/chunks/remoteEntry.js",
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "^18.2.0",
          eager: false,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "^18.2.0",
          eager: false,
        },
      },
    })
  );

  // Resolve fallbacks for webpack 5
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "crypto": require.resolve("crypto-browserify"),
  };

  return config;
};