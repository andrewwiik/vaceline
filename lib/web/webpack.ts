import * as path from 'path'
import webpack from 'webpack'
const merge = require('webpack-merge')
import { browser } from './webpack/browser'
import WebpackBar from 'webpackbar'
// eslint-disable-next-line
const VisualizerPlugin = require('webpack-visualizer-plugin')

const distWeb = path.resolve('public/dist')

const config: Array<webpack.Configuration> = [
  merge(browser, {
    mode: 'production',
    entry: path.resolve('src/index.tsx'),
    output: {
      path: distWeb,
      filename: 'index.js',
    },
    plugins: [
      new VisualizerPlugin(),
      new WebpackBar({
        name: 'browser',
        color: 'green',
      }),
    ],
  }),
  merge(browser, {
    target: 'webworker',
    mode: 'production',
    entry: path.resolve('src/worker.js'),
    output: {
      path: distWeb,
      filename: 'worker.js',
    },
    plugins: [
      new WebpackBar({
        name: 'worker',
        color: 'darkgreen',
      }),
    ],
  }),
]

const compiler = webpack(config)

const isWatch = process.argv.includes('--watch')

// compiler.hooks.beforeRun.tap('delete on start', () => {
//   rimraf.sync(distWeb)
// })

if (isWatch) {
  console.log('webpack: watching started')
  compiler.watch({}, (err, stats) => {
    if (err) console.error(err)

    console.log(stats.toString({ colors: true }))
  })
} else {
  compiler.run((err, stats) => {
    if (err) console.error(err)

    console.log(stats.toString({ colors: true }))
  })
}
