import  { default as createDebug }  from 'debug'
const debug = createDebug('Server')

import { writeFileSync, readFile, readFileSync, realpathSync, lstatSync, readdirSync  } from 'fs'
import { join } from 'path'
import { createServer as createHttpServer } from 'http'
import { is, creatorName, objectType } from '../../utils/var'
import { ip } from '../../utils/req'
import { RolesAndGroups } from './rolesandgroups'
import { ROUTEMETHODS as METHODS } from '../../constants/routemethods'
import { LOGMETHODS } from '../../constants/logmethods'
import { Route } from './route'
import { Router } from './router'
import { AuthBase } from './auth'
import { Command } from '../vendor/commander'
import { createAuthFreeIPA as createIdentity, AuthFreeIPA as Identity} from '../auth/freeipa'

// TODO move to fileutils or smoething


const isDirectory = (source) => lstatSync(source).isDirectory()
const isFile = (source) => {
  try {
  return lstatSync(source).isFile()
  } catch (e) {
    return false
  }
}

const getDirectories = (source) => readdirSync(source)
                                    .map(name => join(source,name))
                                    .filter(isDirectory)
                                    .map(n=>n.split('/').pop())

const getFiles = (source) => readdirSync(source).map(name => join(source,name)).filter(isFile).map(n=>n.split('/').pop())

const PORT = 4444
const IP = '127.0.0.1'

export class HTTPServer extends RolesAndGroups {
  constructor (auth, router, config, roles, groups, logger ) {
    super(roles, groups, logger)

    if (!auth) throw new Error('no auth')
    debug('got auth', is(auth))
    if (auth instanceof AuthBase) {
      this.auth = auth
    } else {
      // TODO allow normal function
      if (objectType(auth) === '[object AsyncFunction]'){
        debug('creating new auth from function')
        const a = new AuthBase(this.logger)
        a.reallyVerify = auth
        a.ping = async () => {
          this._logger.info('auth mock')
          return {uid:'mock',roles:['mock'],groups:['mock']}
        }
        this.auth = a
      } else {
        if (auth.server && (auth.base || auth.binduser || auth.bindpass)) {
          debug('creatring auth with createIdentity',auth)
          if (!auth.logger) auth.logger = this.logger
          this.auth = createIdentity(auth)
        } else throw new Error('auth must be AsyncFunction or instance of AuthBase')
      }
    }

    if (!router) throw new Error('no router')
    debug('got router',is(router))
    if (router instanceof Router) {
      if (!router.roles) router.roles = this.roles
      if (!router.groups) router.groups = this.groups
      this.router = router
    } else {
      let routes = []
      debug('preparing ...routes')
      for (const name of Object.keys(router)){
        debug(name,'=',is(router[name]))
        router[name].route = name
        const tmp = {}
        tmp[name] = router[name]
        routes.push(tmp)
      }
      const rr = new Router(this._logger,this.roles, this.groups, ...routes)
      this.router = rr
    }
    this.port = PORT
    this.ip = IP

    const cliParams = new Command()
    cliParams
      .version('0.0.1')
      .usage('[options]')
      .option('--ping','ping backends')
      .option('-t, --test','run once')
      .option('-T, --dump-config','dump configuration')
      .option('-U, --dump-config-undefined','dump configuration with undefined')
      .option('-P, --dump-permissions','dump roles & groups')
      .option('-D, --create-dummy-html','create dummy html for routes')
      .option('-c, --config [file]', 'set configuration file','./config.js')
      for (const param of this.settings) {
        cliParams.option('--'+param+ ' ['+typeof this[param]+']','server '+param+ ' (default: '+this[param]+')')
      }
      for (const param of this.auth.settings) {
        cliParams.option('--auth-'+param + ' ['+typeof this.auth[param]+']','auth '+param+ ' (default: '+this.auth[param]+')')
      }
      for (const param of this.router.settings){
        cliParams.option('--router-'+param + ' ['+typeof this.router[param]+']','auth '+param+ ' (default: '+this.router[param]+')')
      }
      for (const route of this.router.routes){
        for (const param of this.router[route].settings) {
          cliParams.option('--'+route+'-'+param + ' ['+typeof this.router[route][param]+']', route+' '+param+ ' (default: '+this.router[route][param]+')')
        }
      }
      cliParams.parse(process.argv);

    let configFile = cliParams.config || './config.js'
    this._configFile = configFile
    try {
      configFile = realpathSync(configFile)
      this._configFile = configFile
    } catch (e) {
      this._configFile = undefined
      if (!(configFile === './config.js')) this.log_info({Config:'no file ' + configFile})
    }
    let conf = {}
    // load config file
    try {
      if (this._configFile) {
        conf = JSON.parse(readFileSync(this._configFile,"utf8"))
        debug('conf',conf,CONFIG)
      }
    } catch (e) {
      this.log_info({Config:configFile,error:e.message})
      this._configFile = undefined
    }

    // patch conf with command line params
    for (const param of this.settings) {
      if (!!cliParams[param] && cliParams[param] != conf[param]) conf[param] = cliParams[param]
    }
    if (!conf.auth) conf.auth = {}
    for (const param of this.auth.settings) {
      const cParam = 'auth'+param.charAt(0).toUpperCase() + param.slice(1)
      if (!!cliParams[cParam] && cliParams[cParam] != conf.auth[param]) conf.auth[param] = cliParams[cParam]
    }
    if (!conf.router) conf.router = {}
    for (const route of this.router.routes){
      if (!conf.router[route]) conf.router[route] = {}
      for (const param of this.router[route].settings) {
        const cParam = route+param.charAt(0).toUpperCase() + param.slice(1)
        if (!!cliParams[cParam] && cliParams[cParam] != conf.router[route][param]) conf.router[route][param] = cliParams[cParam]
      }
    }

    // conf ready, apply now
    this.readConfig(conf)

    // just dump conf
    if (cliParams.dumpConfig) {
      process.stdout.write(['/* config dump  */\nmodule.exports = ',JSON.stringify(this.config,null,'\t'),'\n'].join('\n'))
      process.exit(0)
    }
    // dump conf with undefined as nulls
    if (cliParams.dumpConfigUndefined) {
      process.stdout.write(['/* config dump  with undefined as nulls */\nmodule.exports = ',JSON.stringify(this.config,function(k, v) { if (v === undefined) { return null; } return v; },'\t'),'\n'].join('\n'))
      process.exit(0)
    }
    // create dummy html
    if (cliParams.createDummyHtml){
      if (!this.router.root) this.log_warning('no root dir for router html')
      for (const route of this.router.routes){
        if (this.router[route].html && this.router[route].htmlroot){
          const html = join(this.router[route].htmlroot,route+'.html')
          if (!isFile(html)) {
            this.log_info({creating:html})
            writeFileSync(html,`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${route}</title>
  </head>
  <body>
    DUMMY ${route}
    <script src="${route}.js"></script>
  </body>
</html>
              `)
          }
          else this.log_info({exists:html})
          const js = join(this.router[route].htmlroot,route+'.js')
          if (!isFile(js)) {
            this.log_info({creating:js})
            writeFileSync(js,`
              /*
                ${route}
              */
              `)
          }
          else this.log_info({exists:js})
        }
      }
      process.exit(0)
    }
    // ping endpoints
    if (cliParams.ping) {
        this.ping((ok) => {
          this.log_info({ping:ok})
          process.exit(0)
        })
    }
    // dump permissions
    if (cliParams.dumpPermissions) {
      this.checkrolesundgroups()
      .then( () => {
        for (const route of this.router.routes){
          for (const method of this.router[route].methods) {
              process.stdout.write([route,method,this.router[route]._methods[method].check.roles,this.router[route]._methods[method].check.groups].join('\t')+'\n')
            }
        }
        process.exit(0)
      })
    }
    // here comes a http server ---------------------------------------------------
    this._server = createHttpServer( async (req, res) => {

      const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
      const strauth = new Buffer.from(b64auth, 'base64').toString()
      const splitIndex = strauth.indexOf(':')
      const username = strauth.substring(0, splitIndex).toLowerCase()
      const password = strauth.substring(splitIndex + 1)

      let user
      if (username && password ) {
        user = await this.auth.verify(username, password,res)
      }
      if (user instanceof Error) {
        if (user.message === 'wrong user password' || user.message === 'not found') {
          // ask password again
          const reauth = {}
          reauth[username] = user.message
          this.log_info({reauth})
          const header = `Basic realm=\"${auth.realm}\"`
          res.setHeader("WWW-Authenticate", header);
          res.writeHead(401)
          res.end()
          return
        }
        if (user.message === 'no auth backend') {
          this.log_emerg({AuthError:user.message,user:username,ip:ip(req)})
          res.writeHead(503)
          res.end()
          return
        }
        this.log_notice({AuthError:user.message,error:user,user:username,ip:ip(req)})
        res.writeHead(404)
        res.end()
        return
      }
      if (!user){
        if (username) this.log_info({reauth:username})
        const header = `Basic realm=\"${auth.realm}\"`
        res.setHeader("WWW-Authenticate", header);
        res.writeHead(401)
        res.end()
        return
      }

      const method = req.method.toLowerCase()
      let route = decodeURIComponent(req.url.slice(1)).split('/').shift().toLowerCase().trim()
      let params = decodeURIComponent(req.url).split('/').pop().toLowerCase().trim()
      debug('in',method, route, params)
      // params without route
      if (route === params && route !== '') route = '/'
      if (!route  && this.router.default) {
        res.writeHead(301, {"Location": '/'+this.router.default+'/', "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0"});
        res.end();
        return
      }
      debug('modified',method, route,params)

      if (this.router[route] && this.router[route]._methods[method] && this.router[route]._methods[method].fn) {
        // set logger ctx to: route, method, user, ip
        // so it can be called from method just with message
        // TODO test readability
        // a {"Route":{"search":{"get":{"user":"hillar","ip":"127.0.0.1","search":"...","search2":"..."}}}}
        // b {"Route":{"route":"search","method":"get","user":"hillar","ip":"127.0.0.1"}}
        let log = Object.assign(this._logger)
        for (const logmethod of LOGMETHODS){
          log['log_' + logmethod] = (...messages) => {
            let msg = []
            let ctx = {method,route,user:user.uid,ip:ip(req)}
            for (const m of messages) {
              if (m instanceof Object) {
                ctx = Object.assign(ctx,m)
              } else msg.push(m)
            }
            if (msg.length > 0 ) ctx.messages = msg
            const tmp = {}
            tmp[route] = {}
            tmp[route][method] = ctx
            //log[logmethod]({Route:tmp})
            //log[logmethod]({route,method,user:user.uid,ip:ip(req),messages})
            log[logmethod](ctx)
          }
        }
        // do we have some params
        let params = decodeURIComponent(req.url).split('/').pop().trim()
        if (params.length === 0 && this.router[route].html) {
          res.writeHead(301, {"Location": '/'+route+'/'+route+'.html', "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0"});
          res.end();
          return
        }

        const giveFile = (filename) => new Promise(resolve => {
          readFile(filename, (err,content) => {
            if (err) {
              log.log_warning({notexists:filename})
              res.writeHead(404)
              res.end()
              resolve(false)
            } else {
              log.log_notice({access:filename})
              res.write(content)
              res.end()
              resolve(true)
            }
          })
        })

        switch (params) {

          case route+'.html':
            //res.write(join(this.router[route].htmlroot,route+'.html'))
            await giveFile(join(this.router[route].htmlroot,route+'.html'))
            break
          case route+'.js':
            //res.write(join(this.router[route].htmlroot,route+'.html'))
            await giveFile(join(this.router[route].htmlroot,route+'.js'))
            break
          case route+'.css':
            //res.write(join(this.router[route].htmlroot,route+'.html'))
            await giveFile(join(this.router[route].htmlroot,route+'.css'))
            break
          //finally call method
          default:
          try {
            await this.router[route]._methods[method].fn(req, res, user, log)
          } catch (e) {
            this.log_emerg({RouteCatchError:{route,method,error:e.message}})
            debug(e)
            res.writeHead(503)
            res.end()
          }
        }
        if (!res.finished) res.end()
      } else {
        this.log_warning({RouteNotExist:{user:user.uid,ip:ip(req),method,route}})
        res.writeHead(404)
        res.end()
      }
      if (!res.finished) res.end() //end request whatever it was
    })


    this._server.on('listening', () => {
      this.log_info('waiting for requests ...')
    })
    // test conf und stuff by running it
    if (cliParams.test) {
      this._server.on('listening', () => {
        this.log_info('closing on --test')
        this._server.close(() => {
           process.exit(0)
         })
      })
    }


    this._server.on('close', () => {
      this.log_info('closing')
    })

    this._server.on('error', (err) => {
      this.log_err({ServerError:err})
    })

    process.on('SIGHUP',  () => {
          this.log_info('got SIGHUP')
          // TODO reload conf
          if (this._configFile) {

          }
    })

    process.on('SIGINT', () => {
      if (process.gotsinint) {
        this.log_info('got another SIGINT, force exit')
        process.exit(0)
      }
      this.log_info('got SIGINT, waiting to server close')
       this._server.close(() => {
          process.exit(0)
        })
      if (!process.gotsinint) process.gotsinint = true
    })

    process.on('SIGTERM', () => {
        this.log_info('got SIGTERM')
        this._server.close(() => {
          process.exit(0)
        })
    })

  }

  set port (port) {
    if (isNaN(port)) throw new Error(Object.getPrototypeOf(this).constructor.name + 'port not a number')
    this._port = port
  }
  get port () {return this._port}

  set ip (ip) {
    if (!(Object.prototype.toString.call(ip) === '[object String]')) throw new Error(Object.getPrototypeOf(this).constructor.name + ' :: ip not string  ' + typeof ip)
    this._ip = ip
  }
  get ip () { return this._ip}

  checkrolesundgroups () {
    return new Promise((resolve,reject) => {
      //throw new Error('asdas');
      let ok = []
      if (!this.router.roles) this.router.roles = this.roles
      if (!this.router.groups) this.router.groups = this.groups
      for (const route of this.router.routes){
          if (!this.router[route].roles) this.router[route].roles = this.router.roles
          if (!this.router[route].groups) this.router[route].groups = this.router.groups
          for (const method of this.router[route].methods) {
            if (!this.router[route]._methods[method].check.roles) this.router[route]._methods[method].check.roles = this.router[route].roles
            if (!this.router[route]._methods[method].check.groups) this.router[route]._methods[method].check.groups = this.router[route].groups
            if (!this.router[route]._methods[method].check.roles) {
              this.log_emerg({'no roles':{route,method}})
              ok.push({roles:{route,method}})
            }
            if (!this.router[route]._methods[method].check.groups) {
              this.log_emerg({'no groups':{route,method}})
              ok.push({groups:{route,method}})
            }
                  //throw new Error('no roles ' + route + ' '+ meth
          }
      }
      if (ok.length > 0) {
        //reject(new Error('permissions not set ' + JSON.stringify(ok) ))
        reject(ok)
      }
      resolve()
    })
  }

  listen (cb) {
    this.checkrolesundgroups()
      .then( () => {
        // do we have html & js for routes
        /* TODO ...
        if (this.router.root) {
          debug('checking',this.router.root)
          for (const d of getDirectories(this.router.root)) {
              debug('found route',d)
              for (const f of getFiles(join(this.router.root,d))) {
                debug('found file',d, f)
              }
          }
        }
        */
        if (this._server.listening) {
          this.log_warning({listening_already:{ip:this.ip,port:this.port}})
        } else {
          this.log_info({STARTING:{ip:this.ip,port:this.port}})
          this._server.listen(this.port,this.ip,cb)
        }
      })
      .catch((error)=>{
        // die because there is something wrong with permissions
        this.log_emerg({BrokenPermisions:error})
        debug(new Error(JSON.stringify({BrokenPermisions:error})))
        process.exit(1)
      })
  }

  get config () {
    const conf = super.config
    conf.auth = this.auth.config
    conf.router = this.router.config
    return conf
  }

  readConfig (conf) {
    super.readConfig(conf)
    if (conf) {
      if (conf.auth) this.auth.readConfig(conf.auth)
      if (conf.router) this.router.readConfig(conf.router)
    }
  }

  async ping (fn) {
    this.log_info({ping:'---------------------------------------'})
    const user = await this.auth.ping()
    let r
    if (!(user instanceof Error)) r = await this.router.ping(user)
    fn(user && r)
  }

}



export function createServer(options) {
  if (!options) throw new Error('no options')
  if (!options.auth) options.auth = new Identity(options.logger)
  return new HTTPServer(options.auth,options.router,options.config,options.roles,options.groups,options.logger)
}
