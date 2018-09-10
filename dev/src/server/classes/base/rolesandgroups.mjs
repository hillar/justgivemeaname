import { Base } from './base'
import { Check } from './check'

export class RolesAndGroups extends Base {

  constructor (roles, groups, logger) {
    super(logger)
    //  add roles & groups non enumerable
    Object.defineProperty(this, '_roles', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: new Check(roles,logger)
    })

    Object.defineProperty(this, '_groups', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: new Check(groups,logger)
    })
  }

  get roles () { return this._roles.list }
  set roles (roles) { this._roles.list = roles }
  isinroles (t) {return this._roles.inList(t)}

  get groups () { return this._groups.list }
  set groups (groups) { this._groups.list = groups }
  isingroups (t) {return this._groups.inList(t)}

  allowed (r = '', g = '') { 
    return (this.isinroles(r) && this.isingroups(g))
  }

}
