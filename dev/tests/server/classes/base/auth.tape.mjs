
import test from 'tape'
import { join } from 'path'
import { unlinkSync as unlink, existsSync as exists } from 'fs'
import { AuthBase } from '../../../../src/server/classes/base/auth.mjs'
test('auth.mjs', function (t) {
  //t.fail('no tests for auth.mjs source src/server/classes/base/auth.mjs')
  const a = new AuthBase()
  t.deepEqual(a.settings,[ 'cachetime', 'cachedir', 'cachefile' ],'settings')
  a.cachetime = -1
  t.deepEqual(a.cachetime,-1,'cachetime')
  const cwd = process.cwd()
  a.cachedir = cwd
  t.deepEqual(a.cachedir,cwd,'cachedir')
  t.deepEqual(exists(a.cachefullname),true,'default file exists')
  unlink(a.cachefullname)
  const fn = 'mysusers.json'
  a.cachefile = fn
  t.deepEqual(a.cachefile,fn,'cachefile')
  t.deepEqual(a.cachefullname,join(process.cwd(),fn),'cachefullname')
  t.deepEqual(exists(a.cachefullname),true,'custom file exists')
  unlink(a.cachefullname)
  
  t.end()
})

    