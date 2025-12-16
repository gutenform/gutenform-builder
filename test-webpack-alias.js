const path = require('path');
const webpackConfig = require('./webpack.config.js');
console.log('Webpack config resolve alias:', webpackConfig.default?.resolve?.alias);
