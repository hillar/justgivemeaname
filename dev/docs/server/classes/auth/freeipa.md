
# AuthFreeIPA

> verify agains FREEIPA

see [source](../../../../src/server/classes/auth/freeipa.mjs)

! depends on http://ldapjs.org/

exports `class AuthFreeIPA`  

`AuthFreeIPA` extends [`AuthBase`](../base/auth.md). On create new accepts optional  server, base, binduser, bindpass, field, rejectUnauthorized

Settings:
* server
* base
* binduser
* bindpass
* field
* rejectUnauthorized
