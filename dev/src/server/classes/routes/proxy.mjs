/*

sample Proxy

*/

import { parse, join } from 'path'
import { request } from 'http'
import { Route } from '../base/route'

export class ProxyRoute extends Route {

  constructor (logger, roles, groups, host, port) {

    super(logger, roles, groups)
    this.host = host
    this.port = port
    //this.path = path

    this.get =   async (req, res, user, log) => {
        const that = this
        console.log('maja',this)
        const result = await new Promise( (resolve) => {
          req.pause()
          let self = that.path ? that.route : that.path
          let pe = parse(decodeURIComponent(req.url))
          pe.dir = pe.dir.replace('/'+this.path,'/')
          const url = join(pe.dir, pe.base)
          console.log('kala',self,this.route,this.path)
          log.log_info({proxy:{url, host:this.host}})
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


    //this.get = this.onRequest
    //this.post = this.onRequest


  }

  get host () { return this._host }
  set host (host) { this._host = host}
  get port () { return this._port }
  set port (port) { this._port = port}
  //get path () { return this._path }
  //set path (path) { this._path = path}

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
