import  { default as createDebug }  from 'debug'
const debug = createDebug('AuthBase')

import { existsSync, accessSync, readFileSync, constants, writeFileSync  } from 'fs'
import { join } from 'path'
import { isString } from '../../utils/var'
import { Base } from './base'
import { User } from './user'

const USERCACHEFILENAME = 'users.json'
const USERCACHEDIR = './cache'
const USERCACHETIME = 1000 * 60

export class AuthBase extends Base {
  constructor (logger,directory = USERCACHEDIR,filename = USERCACHEFILENAME, cachetime = USERCACHETIME) {
    super(logger)

      Object.defineProperty( this, '_users', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: {}
      } )

      Object.defineProperty( this, '_cachetime', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: cachetime
      } )

      Object.defineProperty( this, 'filecache', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: true
      } )

      Object.defineProperty( this, '_cachedir', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: directory
      } )

      Object.defineProperty( this, '_cachefile', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: filename
      } )

    }

  get cachetime () { return this._cachetime }
  set cachetime (ms) { if (!isNaN(ms)) this._cachetime = ms }

  get cachefullname () { if (this.filecache) return join(this.cachedir,this.cachefile) }

  get cachedir () {return this._cachedir}
  set cachedir (cd) {
    if (!(isString(cd))) throw new Error(this.typeof + ' :: directory not string  ' + typeof cd)
    if (!existsSync(cd)) {
      this.filecache = false
      this.log_warning({notexists:cd})
      return
    } else this._cachedir = cd
    if (this.cachefile) {
      this.log_info({'new users cache directory ': this.cachefullname})
      this.saveCache()
    }
  }
  get cachefile () {return this._cachefile}
  set cachefile (cf) {
    if (!(isString(cf))) throw new Error(this.typeof + ' :: filename not string  ' + typeof cf)

    if (this.filecache) {
      if (existsSync(join(this._cachedir,cf))) {
        try {
            accessSync(join(this._cachedir,cf), constants.W_OK)
          } catch (err) {
            this.filecache = false
            return
          }
          this._cachefile = cf
          this._users = this.loadCache()
          return
      } else {
        if (this._cachefile !== cf) this.log_info({'new users cache ':this._cachedir+'/'+cf})
        this._cachefile = cf
        this.saveCache()
      }
    }
  }

  async verify(username,password) {

    if (!(isString(username))) throw new Error(this.typeof + ' :: username not string  ' + typeof username)
    if (!(isString(password))) throw new Error(this.typeof + ' :: password not string  ' + typeof password)

    return new Promise(async (resolve) => {
      if (!username.trim()) {
        this.log_alert('no username')
        resolve(new Error('no username'))
      } else {
        if (!password.trim()) {
          this.log_alert({'no password': username})
          resolve(new Error('no password'))
        } else {
          if (this._users[username]) {
            const now = Date.now()
            if (this._users[username].lastVerify + this.cachetime > now) {
              resolve(this._users[username])
            } else {
              this._users[username] = await this.reallyVerify(username,password)
              if (this._users[username].uid !== username) {
                resolve({})
              } else {
              this._users[username].lastVerify = Date.now()
              this.saveCache()
              resolve(this._users[username])
              }
            }
          } else {
                  let user
                  try {
                    user  = await this.reallyVerify(username,password)
                  } catch (e){
                    this.log_emerg({reallyVerify:e.message})
                    debug(e)
                    resolve(e)
                    return
                    //throw e
                  }
                  if (user instanceof Error) {
                    resolve(user)
                    return
                  }
                  if (user.uid !== username) {
                    resolve(new Error('not original user'))
                  } else {
                  this._users[username] = user
                  this._users[username].lastVerify = Date.now()
                  this._users[username].firstVerify = Date.now()
                  this.saveCache()
                  resolve(this._users[username])
                  }
          }
        }
      }
    })
  }

  async reallyVerify (username,password) {
    //debug('real verify',username,password,Object.getPrototypeOf(this).constructor.name)
    if (!(Object.getPrototypeOf(this).constructor.name === 'AuthBase')) throw new Error('reallyVerify not implemented')
    //uid,ssn, fn,ln,ou,manager,emails,phones,roles,groups
    const user = new User(this._logger,'dummy','1234567','firstname','lastname','org unit','manager','','','','')
    return new Promise((resolve) => {
            // Wait a bit
            setTimeout(() => {
                resolve(user.toObj())
            }, 100)
        })
  }

  loadCache () {
    if (this.filecache && this.cachefullname) {
      if (existsSync(this.cachefullname)){
        let u
        try {
          u = JSON.parse(readFileSync(this.cachefullname))
          //debug('u',u)
        } catch (e) {
          this.log_err(e)
          return {}
        }
        this.log_info({'loaded users cache from ':this.cachefullname})
        return u
      } else this.log_emerg({notexists:this.cachefullname})
    }
    return {}
  }
  saveCache () {
    if (this.filecache && this.cachefullname) {
      try {
        writeFileSync(this.cachefullname, JSON.stringify(this._users))
      } catch (error) {
        this.log_err(error)
      }
    }
  }

}
