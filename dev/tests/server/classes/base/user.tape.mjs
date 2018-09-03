
process.alias = 'test user.mjs'
import test from 'tape'
import { User, createUser } from '../../../../src/server/classes/base/user.mjs'
test('user.mjs', function (t) {
  // uid, roles, groups, ssn='', fn='', ln='', ou = '',manager = '',emails = '',phones = ''
  t.throws(() => {const x = new User()},'throws on no uid')
  t.throws(() => {const x = new User(1)},'throws on bad uid')

  t.throws(() => {const x = new User('1234')},'throws on no roles')
  t.throws(() => {const x = new User('1234',1)},'throws on bad roles')

  t.throws(() => {const x = new User('1234','any')},'throws on no groups')
  t.throws(() => {const x = new User('1234','any',1)},'throws on bad groups')

  const x = new User('1234','any','some')
  t.deepEqual(JSON.parse(JSON.stringify(x.toObj())),{ uid: '1234', roles: [ 'any' ], groups: [ 'some' ] },'init dummy user')

  t.deepEqual(JSON.parse(JSON.stringify(createUser({uid:'3214',roles:'any',groups:'some'}).toObj())),{ uid: '3214', roles: [ 'any' ], groups: [ 'some' ] },'createUser dummy user')

  t.end()

})
