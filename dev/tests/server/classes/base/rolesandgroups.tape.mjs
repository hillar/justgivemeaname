
process.alias = 'test rolesandgroups.mjs'
import test from 'tape'
import { RolesAndGroups } from '../../../../src/server/classes/base/rolesandgroups.mjs'
test('rolesandgroups.mjs', function (t) {

  t.doesNotThrow(() => {const x = new RolesAndGroups()},'does not throw on no lists')

  const rg = new RolesAndGroups('*','some')
  t.deepEqual(rg.allowed('any','some'),true,'allowed')
  t.deepEqual(rg.allowed('any','any'),false,'not allowed')
  t.deepEqual(rg.allowed('any'),false,'not allowed')
  t.throws(() => {rg.allowed(1,2)},'throws on bad check value')
  t.end()
})
