import  { default as createDebug }  from 'debug'
const debug = createDebug('Router')

import { is, isFn, creatorName, objectType } from '../../utils/var'
import  { realpathSync, access, constants }  from 'fs'
import { join } from 'path'
import { RolesAndGroups }  from './rolesandgroups'
import { Route } from './route'

export class Router extends RolesAndGroups {

  constructor (logger, roles, groups, ...routes) {

    super(roles, groups, logger)


    Object.defineProperty(this, '_root', {
      enumerable: false,
      configurable: true,
      writable: true
    })
    Object.defineProperty(this, '_defaultroute', {
      enumerable: false,
      configurable: true,
      writable: true
    })

    this.htmlroot = './src/html/routes'
    debug('looping routes')
    for (const route of routes) {
      const name = Object.keys(route).shift()
      debug(name,is(route))
      if (name) {
        if (route[name] instanceof Route){
          debug('got Route', name, is(route[name]))
          this[name] = route[name]
          this[name].route = name
          if (route[name].html && !route[name].htmlroot ) this[name].htmlroot = join(this.htmlroot,name)
          if (!route[name].roles) route[name].roles = this.roles
          if (!route[name].groups) route[name].groups = this.groups

        } else {
          debug('creating Route', name, is(route[name]))
          let methods = []
          for (const method of Object.keys(route[name])){
            if (isFn(route[name][method])) {
              const tmp = {}
              tmp[method] = route[name][method]
              methods.push(tmp)
            }
          }
          const r = new Route(this.logger,this.roles,this.groups, ...methods)
          r.route = name
          this[name] = r
        }
      }
    }
  }

  get default () { return this._defaultroute }
  set default (route) {
    if (!this.routes.includes(route)) throw new Error('can not set as default, route not exist: ' + route)
    this._defaultroute = route
  }

  get htmlroot () { return this._root }
  set htmlroot (root) {
    if (!(Object.prototype.toString.call(root) === '[object String]')) throw new Error('router root not a string ' + typeof root)
    if (root === '/') throw new Error('router root must not be /')
    if (!root) throw new Error('router root must not be empty')
    try {
      this._root = realpathSync(root)
      if (this._root === '/') throw new Error('router root must not be /')
    } catch (err) {
      this._root = root
      this.log_warning({notexists:root})
    }
  }

  get routes () { return Object.keys(this)}

  get config () {
    const conf = super.config
    conf.roles = this.roles
    conf.groups = this.groups
    for (const route of this.routes){
      conf[route] = this[route].config
    }
    return conf
  }

  readConfig (conf) {
    super.readConfig(conf)
    for (const route of this.routes){
      if (conf[route]) this[route].readConfig(conf[route])
    }
    return conf
  }

  async ping (user) {
    let result = true
    if (this.htmlroot) {
        result = await new Promise((resolve)=>{
          access(this.htmlroot, constants.R_OK, (err) => {
            if (err) {
              this.log_err({ping:'failed',notexist:this.htmlroot})
              resolve(false)
            } else {
              this.log_info({ping:'ok',readable:this.htmlroot})
              resolve(true)
            }
          })
        })
    }
    this.log_info('pinging all routes')
    for (const route of this.routes){
      this.log_info({ping:route})
      if (this[route].ping){
          const r = await this[route].ping(user,route)
          if (!r) result = false
      } else {
        this.log_alert('not a route, missing ping ' + route)
        throw new Error('not a route ' + route)
        result = false
      }
    }
    return result
  }
}
