var path = require("path");
var webpack = require("webpack");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// If we're running the webpack-dev-server, assume we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';
console.log("Bundling for " + (isDevelopment ? "development" : "production") + "...");

/** @type {import("webpack").Configuration } */
module.exports = {
    entry: './src/fableBuild/Main.js',
    output: {
        path: path.join(__dirname, "dist"),
        // library: "require",
		// libraryTarget: "this"
    },
    // It is suggested to run both `react-refresh/babel` and the plugin in the `development` mode only,
    // even though both of them have optimisations in place to do nothing in the `production` mode.
    // If you would like to override Webpack's defaults for modes, you can also use the `none` mode -
    // you then will need to set `forceEnable: true` in the plugin's options.
    mode: isDevelopment ? 'development' : 'production',
    devServer: {
        hot: true,
        contentBase: path.join(__dirname, 'public'),
        publicPath: "/",
        proxy: {
            '/api/*': {
                target: 'https://localhost:3000',
                changeOrigin: true,
                secure: false
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: path.join(__dirname, 'src'),
                use: 'babel-loader'
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*)?$/,
                use: ["file-loader"]
            }
        ],
    },
    plugins: [
        // ... other plugins
        isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    // ... other configuration options
};
