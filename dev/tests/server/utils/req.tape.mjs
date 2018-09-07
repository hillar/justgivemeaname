
process.alias = 'test req.mjs'
import test from 'tape'
import {ip, params } from '../../../src/server/utils/req.mjs'
test('req.mjs', function (t) {

  //ip
  t.deepEqual(ip(),undefined)
  const req = {}
  req.headers = []
  req.socket = {}
  req.socket.remoteAddress = '1.2.3.4'
  t.deepEqual(ip(req),{ remoteAddress: '1.2.3.4' })

  // TODO params

  t.end()
})
