import test from 'tape'
import * as that from '../../../src/server/constants/routemethods.mjs' 
test('routemethods.mjs', function (t) {
  t.deepEqual(that,{ ROUTEMETHODS: [ 'get', 'post', 'put', 'patch', 'delete' ] })
  t.end()
})

    