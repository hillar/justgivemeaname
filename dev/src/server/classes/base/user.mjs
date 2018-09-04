import { trimArrayOfStrings } from '../../utils/var'
import { Base } from './base'

export class User extends Base {
  constructor (uid, roles, groups, ssn='', fn='', ln='', ou = '',manager = '',emails = '',phones = '',logger) {
    super(logger)
    this.uid = uid
    this.ssn = ssn
    this.fn = fn
    this.ln = ln
    this.ou = ou
    this.manager = manager
    this.emails = emails
    this.phones = phones
    this.roles = roles
    this.groups = groups
  }

  get  uid () { return this._uid }
  get  ssn () { return this._ssn }
  get  fn () { return this._fn }
  get  ln () { return this._ln }
  get  fullName () { return this._fn + ' '+ this._ln}
  get  ou () { return this._ou }
  get  manager () { return this._manager }
  get  emails () { return this._emails }
  get  phones () { return this._phones }
  get  roles () { return this._roles  }
  get  groups () { return this._groups }


set  uid (uid) {
	if (!(Object.prototype.toString.call(uid) === '[object String]')) throw new Error(this.typeof + ' :: uid not string  ' + typeof uid)
	if (!uid.trim()) this.log_alert({empty:'uid'})
	else this._uid = uid
}

set  ssn (ssn) {
	if (!(Object.prototype.toString.call(ssn) === '[object String]')) throw new Error(this.typeof + ' :: ssn not string  ' + typeof ssn)
	if (!ssn.trim()) this.log_info({uid:this.uid,empty:'ssn'})
	else this._ssn = ssn
}

set  fn (fn) {
	if (!(Object.prototype.toString.call(fn) === '[object String]')) throw new Error(this.typeof + ' :: fn not string  ' + typeof fn)
	if (!fn.trim()) this.log_err({uid:this.uid,empty:'fn'})
	else this._fn = fn
}

set  ln (ln) {
	if (!(Object.prototype.toString.call(ln) === '[object String]')) throw new Error(this.typeof + ' :: ln not string  ' + typeof ln)
	if (!ln.trim()) this.log_err({uid:this.uid,empty:'ln'})
	else this._ln = ln
}

set  ou (ou) {
	if (!(Object.prototype.toString.call(ou) === '[object String]')) throw new Error(this.typeof + ' :: ou not string  ' + typeof ou)
	if (!ou.trim()) {}//this.log_info({uid:this.uid,empty:'ou'})
	else this._ou = ou
}

set  manager (manager) {
	if (!(Object.prototype.toString.call(manager) === '[object String]')) throw new Error(this.typeof + ' :: manager not string  ' + typeof manager)
	if (!manager.trim()) {}//this.log_info({uid:this.uid,empty:'manager'})
	else this._manager = manager
}

set  emails (emails) {
if (Object.prototype.toString.call(emails) === '[object String]') emails = [emails.trim()]
if (Array.isArray(emails)) emails = trimArrayOfStrings(emails)
else throw new Error(this.typeof + ' :: emails not a string nor array'+ typeof emails)
if (Array.isArray(emails) && emails.length > 0) this._emails = emails
else this.log_info({uid:this.uid,empty:'emails'})

}

set  phones (phones) {
if (Object.prototype.toString.call(phones) === '[object String]') phones = [phones.trim()]
if (Array.isArray(phones)) phones = trimArrayOfStrings(phones)
else throw new Error(this.typeof + ' :: phones not a string nor array'+ typeof phones)
if (Array.isArray(phones) && phones.length > 0) this._phones = phones
//else this.log_info({uid:this.uid,empty:'phones'})

}

set  roles (roles) {
if (Object.prototype.toString.call(roles) === '[object String]') roles = [roles.trim()]
if (Array.isArray(roles)) roles = trimArrayOfStrings(roles)
else throw new Error(this.typeof + ' :: roles not a string nor array'+ typeof roles)
if (Array.isArray(roles) && roles.length > 0) this._roles = roles
else this.log_alert({uid:this.uid,empty:'roles'})

}

set  groups (groups) {
if (Object.prototype.toString.call(groups) === '[object String]') groups = [groups.trim()]
if (Array.isArray(groups)) groups = trimArrayOfStrings(groups)
else throw new Error(this.typeof + ' :: groups not a string nor array'+ typeof groups)
if (Array.isArray(groups) && groups.length > 0) this._groups = groups
else this.log_alert({uid:this.uid,empty:'groups'})

}

toObj () {
  const a = {}
  for (const s of this.settings) a[s] = this[s]
  return a
}

}

export function createUser(o) {
  if (!o) throw new Error('createUser: no user object')
  return new User(o.uid, o.roles, o.groups, o.ssn, o.fn, o.ln, o.ou ,o.manager ,o.emails ,o.phones, o.logger)
}
