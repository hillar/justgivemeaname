import { readFile } from 'fs'
import { createServer as createHttpsServer } from 'https'
import { createServer, request as fetch } from 'http'
import httpProxy from  'http-proxy'
import { resolve } from 'path'


import mime from 'mime'
import opener from 'opener'

export default function serve_proxy (options = { contentBase: '' }) {
  if (Array.isArray(options) || typeof options === 'string') {
    options = { contentBase: options }
  }
  options.contentBase = Array.isArray(options.contentBase) ? options.contentBase : [options.contentBase]
  options.host = options.host || 'localhost'
  options.port = options.port || 10001
  options.headers = options.headers || {}
  options.https = options.https || false
  options.openPage = options.openPage || ''
  mime.default_type = 'text/plain'
  options.proxy = options.proxy || false

  const requestListener = (request, response) => {
    // Remove querystring
    const urlPath = decodeURI(request.url.split('?')[0])

    Object.keys(options.headers).forEach((key) => {
      response.setHeader(key, options.headers[key])
    })

    readFileFromContentBase(options.contentBase, urlPath, function (error, content, filePath) {
      if (!error) {
        return found(response, filePath, content)
      }
      if (error.code !== 'ENOENT') {
        response.writeHead(500)
        response.end('500 Internal Server Error' +
          '\n\n' + filePath +
          '\n\n' + Object.keys(error).map(function (k) {
            return error[k]
          }).join('\n') +
          '\n\n(rollup-plugin-serve)', 'utf-8')
        return
      }
      if (request.url === '/favicon.ico') {
        filePath = resolve(__dirname, '../dist/favicon.ico')
        readFile(filePath, function (error, content) {
          if (error) {
            notFound(response, filePath)
          } else {
            found(response, filePath, content)
          }
        })
      } else if (options.historyApiFallback) {
        var fallbackPath = typeof options.historyApiFallback === 'string' ? options.historyApiFallback : '/index.html'
        readFileFromContentBase(options.contentBase, fallbackPath, function (error, content, filePath) {
          if (error) {
            notFound(response, filePath)
          } else {
            found(response, filePath, content)
          }
        })
      } else if (options.proxy){
        request.pause()
        let isproxy
        for (const rp of Object.keys(options.proxy)) {
          if (request.url.startsWith(rp)) isproxy = rp
        }
        if (isproxy) {
          const url = request.url.replace(isproxy,options.proxy[isproxy])
          console.log(green(request.url),'-(',request.method,')->',url)
          const proxy = httpProxy.createProxyServer({})
          request.url = url
          // echo proxy response
          proxy.on('proxyRes', function (proxyRes, req, res) {
              var body = new Buffer('');
              proxyRes.on('data', function (data) {
                  body = Buffer.concat([body, data]);
              });
              proxyRes.on('end', function () {
                  body = body.toString();
                  console.log(green("res from proxied server:"),'\n'+body+'\n');
              });
          });

          proxy.web(request, response, { target: options.proxy[isproxy] }, function(e) {
            console.log(red('proxy req error:'))
            console.error(e)
            response.writeHead(500)
            response.end('' +
              '\n\n' + JSON.stringify(options.proxy) +
              '\n\n' + e +
              '\n\n(rollup-plugin-serve)', 'utf-8')
          });

        } else {
          notFound(response, filePath)
        }
        request.resume()
      } else {
        notFound(response, filePath)
      }
    })
  }

  // If HTTPS options are available, create an HTTPS server
  let server
  if (options.https) {
    server = createHttpsServer(options.https, requestListener).listen(options.port)
  } else {
    server = createServer(requestListener).listen(options.port)
  }

  closeServerOnTermination(server)

  var running = options.verbose === false

  return {
    name: 'serve',
    ongenerate () {
      if (!running) {
        running = true

        // Log which url to visit
        const url = (options.https ? 'https' : 'http') + '://' + options.host + ':' + options.port
        options.contentBase.forEach(base => {
          console.log(green(url) + ' -> ' + resolve(base))
        })

        // Open browser
        if (options.open) {
          opener(url + options.openPage)
        }
      }
    }
  }
}

function readFileFromContentBase (contentBase, urlPath, callback) {
  let filePath = resolve(contentBase[0] || '.', '.' + urlPath)

  // Load index.html in directories
  if (urlPath.endsWith('/')) {
    filePath = resolve(filePath, 'index.html')
  }

  readFile(filePath, (error, content) => {
    if (error && contentBase.length > 1) {
      // Try to read from next contentBase
      readFileFromContentBase(contentBase.slice(1), urlPath, callback)
    } else {
      // We know enough
      callback(error, content, filePath)
    }
  })
}

function notFound (response, filePath) {
  response.writeHead(404)
  response.end('404 Not Found' +
    '\n\n' + filePath +
    '\n\n(rollup-plugin-serve)', 'utf-8')
}

function found (response, filePath, content) {
  response.writeHead(200, { 'Content-Type': mime.lookup(filePath) })
  response.end(content, 'utf-8')
}

function green (text) {
  // FgGreen = "\x1b[32m"
  return '\u001b[1m\u001b[32m' + text + '\u001b[39m\u001b[22m'
}

function red (text) {
  // FgRed = "\x1b[31m"
  return '\u001b[1m\u001b[31m' + text + '\u001b[39m\u001b[22m'
}

function closeServerOnTermination (server) {
  const terminationSignals = ['SIGINT', 'SIGTERM']
  terminationSignals.forEach((signal) => {
    process.on(signal, () => {
      server.close()
      process.exit()
    })
  })
}
