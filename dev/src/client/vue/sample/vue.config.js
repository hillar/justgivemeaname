module.exports = {
  outputDir: '../../../static',
  devServer: {
    proxy: {
      '/proxy' : {
        target: 'http://localhost:4444',
        changeOrigin: true
      }
    }
  },
  baseUrl: '/html/'
}
