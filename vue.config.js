const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      title: 'BTG Transparency',
      entry: './src/main.js'
    }
  }
})
