
process.alias = 'test index.mjs'
import test from 'tape'
import * as that from '../../../../../src/server/classes/vendor/commander/index.mjs'
test('index.mjs', function (t) {
  //t.fail('no tests for index.mjs source src/server/classes/vendor/commander/index.mjs')
  t.deepEqual(that,'')
  t.end()
})
