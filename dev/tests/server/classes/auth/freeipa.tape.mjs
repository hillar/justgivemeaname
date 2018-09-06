import test from 'tape'
import { join } from 'path'
import { unlinkSync as unlink, existsSync as exists } from 'fs'
import { AuthFreeIPA } from '../../../../src/server/classes/auth/freeipa.mjs'
test('freeipa.mjs', async function (t) {
  //t.fail('no tests for freeipa.mjs source src/server/classes/auth/freeipa.mjs')
  const f = new AuthFreeIPA()
  t.deepEqual(f.settings,[ 'server', 'base', 'binduser', 'bindpass', 'field', 'proto', 'port', 'cachetime', 'cachedir', 'cachefile' ])

  // see https://www.freeipa.org/page/Demo
  f.server = 'ipa.demo1.freeipa.org'
  f.base = 'dc=demo1,dc=freeipa,dc=org'
  f.binduser = 'employee'
  f.bindpass = 'Secret123'
  f.cachetime = -1
  let u
  try {
    u = await f.verify(f.binduser,f.bindpass)
  } catch (e) {
    t.deepEqual(e.message,'')
  }
  t.deepEqual(u.uid,'employee')
  
  //TODO local freeipa

  t.end()

})
