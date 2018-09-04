

import test from 'tape'
import { trimArrayOfStrings } from '../../../src/server/utils/var.mjs'
test('var.mjs', function (t) {
  
  t.deepEqual(trimArrayOfStrings(['']),[],'empty')
  t.deepEqual(trimArrayOfStrings([' ']),[],'space')
  t.deepEqual(trimArrayOfStrings([' ','  ']),[],'double space')  
  t.deepEqual(trimArrayOfStrings([' a','a  ', ' a ']),[ 'a' ],'string trim')
  t.deepEqual(trimArrayOfStrings(['a','b']),[ 'a', 'b' ],'string trim')

  t.end()
  
})

    