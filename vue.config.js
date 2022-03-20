const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: './',
  transpileDependencies: true,
  pages: {
    index: {
      title: 'BTG Transparency',
      entry: './src/main.js'
    }
  }
})
