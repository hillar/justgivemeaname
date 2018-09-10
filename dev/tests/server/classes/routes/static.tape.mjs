
process.alias = 'test static.mjs'
import test from 'tape'
import { StaticRoute } from '../../../../src/server/classes/routes/static.mjs'
test('static.mjs', function (t) {

  t.throws(() => {const s = new StaticRoute(null,null,null,'/')},'throws on init bad root /')
  t.throws(() => {const s = new StaticRoute(null,null,null,'  ')},'throws on init bad root "  "')

  const s = new StaticRoute()

  let intercepted = ''
  const old_stdout_write = process.stdout.write
  process.stdout.write = (s) => { intercepted = s }
  s.root = '/tmp/siineiolekalajaeituleka'
  process.stdout.write = old_stdout_write
  //console.log('int',intercepted)
  t.deepEqual(intercepted.includes('siineiolekalajaeituleka'),true,'log notexists')
  //t.deepEqual(s.settings,'')
  t.end()
})
