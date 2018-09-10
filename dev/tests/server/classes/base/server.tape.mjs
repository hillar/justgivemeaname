
process.alias = 'test server.mjs'
import test from 'tape'
import { Server } from '../../../../src/server/classes/base/server.mjs'
test('server.mjs', function (t) {

  t.throws(() => {const s = new Server()},'throws on init bad auth')
  //t.deepEqual(s,'')
  t.end()
})
