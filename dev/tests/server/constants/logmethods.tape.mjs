
process.alias = 'test logmethods.mjs'
import test from 'tape'
import * as that from '../../../src/server/constants/logmethods.mjs'
test('logmethods.mjs', function (t) {
  t.deepEqual(that,{ LOGMETHODS: [ 'emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug' ] })
  t.end()
})
