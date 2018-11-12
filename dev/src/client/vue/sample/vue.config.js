module.exports = {
  outputDir: '../../../../static',
  devServer: {
    proxy: {
      '/hackertarget' : {
        target: 'http://localhost:4444/',
        changeOrigin: true
      }
    }
  },
  baseUrl: '/dist/'
}
