const fs = require('fs');
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const typescriptImportPluginFactory = require('ts-import-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const typescriptStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const webpack = require('webpack');

const env = require('./env');

module.exports = () => {
    const isProd = env.NODE_ENV === 'production';
    const isDev = !isProd;

    const processPath = process.cwd();

    const paths = {
        entry: path.resolve(processPath, './src/index.tsx'),
        dist: path.resolve(processPath, './dist'),
        public: path.resolve(processPath, './public'),
        tsconfig: path.resolve(processPath, './tsconfig.json'),
        template: path.resolve(processPath, './src/index.ejs'),
    };

    const devServer = {
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' },
        host: 'localhost',
        historyApiFallback: true,
        static: {
            publicPath: 'auto',
        },
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
    };

    const useHtmlWebpackPlugin = fs.existsSync(paths.template);

    const definePluginDefinitions = {
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        'process.env.BUILD_VERSION': JSON.stringify(env.BUILD_VERSION),
        'process.env.BUILD_TIMESTAMP': JSON.stringify(env.BUILD_TIMESTAMP),
    };

    return {
        mode: env.NODE_ENV,
        context: processPath,
        devtool: isProd ? false : 'eval-cheap-module-source-map',
        devServer,
        entry: paths.entry,
        output: {
            path: paths.dist,
            filename: '[contenthash:8].js',
            chunkFilename: '[contenthash:8].chunk.js',
            publicPath: 'auto',
            environment: {
                arrowFunction: false,
                bigIntLiteral: false,
                const: false,
                destructuring: false,
                dynamicImport: false,
                forOf: false,
                module: false,
            },
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
            plugins: [
                new TsConfigPathsPlugin({
                    configFile: paths.tsconfig,
                }),
            ],
        },
        optimization: {
            minimize: isProd,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        compress: true,
                        format: {
                            comments: false,
                        },
                    },
                    extractComments: false,
                }),
            ],
        },
        module: {
            rules: [
                {
                    test: /\.(tsx?|jsx?)$/,
                    exclude: /node_modules/,
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        happyPackMode: true,
                        allowTsInNodeModules: true,
                        getCustomTransformers: () => ({
                            before: [
                                isDev && typescriptStyledComponentsTransformer(),
                                typescriptImportPluginFactory({
                                    libraryName: 'lodash',
                                    libraryDirectory: null,
                                    camel2DashComponentName: false,
                                }),
                            ].filter(Boolean),
                        }),
                    },
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    include: /images/,
                    exclude: /node_modules/,
                    type: 'asset/resource',
                },
                {
                    test: /\.svg$/,
                    include: /icons/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: '@svgr/webpack',
                            options: {
                                svgoConfig: {
                                    plugins: [
                                        {
                                            name: 'removeViewBox',
                                            active: false,
                                        },
                                    ],
                                },
                            },
                        },
                        'url-loader',
                    ],
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin(definePluginDefinitions),
            useHtmlWebpackPlugin &&
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: paths.template,
                base: './',
                minify: false,
                isProd,
                isDev,
            }),
            fs.existsSync(paths.public) &&
            new CopyWebpackPlugin({
                patterns: [{ from: paths.public, to: paths.dist }],
            }),
        ].filter(Boolean),
    };
};
