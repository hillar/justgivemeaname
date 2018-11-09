/*

sample Proxy

*/
import  { default as createDebug }  from 'debug'
const debug = createDebug('ProxyRoute')

import { parse, join } from 'path'
import { request } from 'http'
import { Route } from '../base/route'

export class ProxyRoute extends Route {

  constructor (logger, roles, groups, host, port) {

    super(logger, roles, groups)
    this.host = host
    this.port = port

    this.get =  this.post = async (req, res, user, log) => {
        const result = await new Promise( (resolve) => {
          req.pause()
          let pe = parse(decodeURIComponent(req.url))
          pe.dir = pe.dir.replace('/'+this.route,'/')
          const url = join(pe.dir, pe.base)
          log.log_info({proxy:{method:req.method,host:this.host, port:this.port, url}})
          const options = {
            hostname: this.host,
            port: this.port,
            path: url,
            method: req.method
          }
          const proxy = request(options, function (r) {
            r.on('error', (e) => {
              log.log_info({r:e})
              console.error(e)
              resolve(true)
            })
            if (r.statusCode != 200) {
              log.log_err({proxyerror:{status:r.statusCode,host:options.hostname}})
              res.writeHead(500)
              res.end()
              resolve(true)
            }
            else r.pipe(res)
          })
          proxy.on('error', (e) => {
            log.log_info({proxy:e})
            console.error(e)
            resolve(true)
          })
          res.on('error', (e) => {
            log.log_info({res:e})
            console.error(e)
            resolve(true)
          })
          res.on('finish', (e) => {
            resolve(true)
          })
          req.on('error', (e) => {
            log.log_info({req:e})
            console.error(e)
            resolve(true)
          })
          req.pipe(proxy)
          req.resume()
        })
        return result
      }

  }

  get host () { return this._host }
  set host (host) { this._host = host}
  get port () { return this._port }
  set port (port) { this._port = port}

  async ping () {
    const result = await new Promise((resolve)=>{
      const options = {
        hostname: this.host,
        port: this.port,
        path: this.path,
        method: 'GET'
      }
      const proxy = request(options, function (r) {
        r.on('error', (e) => {
          log.log_info({r:e})
          console.error(e)
          resolve(false)
        })
      })
      proxy.on('error', (e) => {
        this.logger.warning({proxy:{error:e, options}})
        resolve(false)
      })
      proxy.on('finish', (e) => {
        this.logger.info({proxy:options})
        resolve(true)
      })
      proxy.end()
    })
    return result
  }

}

export function createProxyRoute(options) {
  if (!options) throw new Error('no options')
  return new ProxyRoute(options.logger, options.roles, options.groups, options.host, options.port)
}
