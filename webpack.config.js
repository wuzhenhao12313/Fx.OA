const webpack = require('webpack');

module.exports = (webpackConfig, env) => {
  // const loader = {
  //   test: /\.css$/,
  //   use: ['style-loader', 'css-loader', 'css-loader?module']
  // }
  //
  // if (webpackConfig.module) {
  //   webpackConfig.module.rules.map((item) => {
  //     if (String(item.test) === '/\\.css/') {
  //       item.use.push('css')
  //     }
  //     return item;
  //   })
  // }

  return webpackConfig;
}
