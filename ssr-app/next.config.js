const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

// Set the environment variable for local webpack
process.env.NEXT_PRIVATE_LOCAL_WEBPACK = 'true';

const nextConfig = {
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'ssr_app',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './ProductCard': './src/components/ProductCard',
          './UserProfile': './src/components/UserProfile',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: "^18.2.0",
          },
          'react-dom': {
            singleton: true,
            requiredVersion: "^18.2.0",
          },
        },
        extraOptions: {
          exposePages: true,
          enableImageLoaderFix: true,
          enableUrlLoaderFix: true,
        },
      })
    );

    return config;
  },
};

module.exports = nextConfig;