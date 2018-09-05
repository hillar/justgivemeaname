
# Class AuthBase

> verify username and password, get back user object. Caches verifications. 

see [source](../../../../src/server/classes/base/auth.mjs)
    

exports `class AuthBase`  

`AuthBase` extends [`Base`](./base.md). On create new accepts optional `cachedir`, `cachefile`, `cachetime` and `logger`.

Settings:

* `cachedir` : default './'
* `cachefile` : default 'users.json'
* `cachetime` : default 6000

Functions:

* verify (username, password) returns [user object](./user.md#toobj) 