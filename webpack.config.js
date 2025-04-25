const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';
  return {
    entry: {
      background: './src/background/index.ts',
      content: './src/content/index.ts',
      popup: './src/popup/index.ts',
      options: './src/options/index.ts'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader, // 使用插件提供的loader
            'css-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]'
          }
        },
      ],
    },
    plugins: [
      // 清空 dist 文件夹
      new CleanWebpackPlugin(),
      
      // 生成 popup.html
      new HtmlWebpackPlugin({
        template: './src/popup/popup.html',
        filename: 'popup.html',
        chunks: ['popup'],
        // 确保注入 CSS 链接
        inject: true,
      }),
      
      // 生成 options.html
      new HtmlWebpackPlugin({
        template: './src/options/options.html',
        filename: 'options.html',
        chunks: ['options'],
      }),
      
      // 复制静态资源
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'static', // 你的静态文件目录
            to: '.',        // 输出到 dist 根目录
            globOptions: {
              ignore: ['**/manifest.json'], // 单独处理 manifest
            },
          },
          {
            from: 'static/manifest.json',
            to: 'manifest.json',
            transform(content) {
              // 可以在这里修改 manifest 内容
              return content;
            },
          },
        ],
      }),
  
      new CopyWebpackPlugin({
          patterns: [
            // 复制图标到 dist/images
            { 
              from: 'static/images/icon.png', 
              to: 'images/icon.png' 
            },
            // 复制 manifest.json（自动替换路径）
            {
              from: 'static/manifest.json',
              to: 'manifest.json',
              transform: (content) => {
                // 自动替换路径
                const manifest = JSON.parse(content.toString());
                manifest.background.service_worker = "background.js";
                manifest.action.default_popup = "popup.html";
                manifest.options_page = "options.html";
                // 批量替换图标路径
                for (let size in manifest.icons) {
                  manifest.icons[size] = manifest.icons[size].replace('src/', '');
                }
                return JSON.stringify(manifest, null, 2);
              }
            }
          ]
        }),
    new MiniCssExtractPlugin({ // 必须添加这个插件实例
      filename: '[name].css',
      chunkFilename: '[id].css',
    })
    ],
    resolve: {
      extensions: ['.ts', '.js'],
    },
  };
}