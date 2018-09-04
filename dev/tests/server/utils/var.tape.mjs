

import test from 'tape'
import { trimArrayOfStrings, isString } from '../../../src/server/utils/var.mjs'
test('var.mjs', function (t) {
  
  // trimArrayOfStrings
  t.deepEqual(trimArrayOfStrings(['']),[],'empty')
  t.deepEqual(trimArrayOfStrings([' ']),[],'space')
  t.deepEqual(trimArrayOfStrings([' ','  ']),[],'double space')  
  t.deepEqual(trimArrayOfStrings([' a','a  ', ' a ']),[ 'a' ],'string trim')
  t.deepEqual(trimArrayOfStrings(['a','b']),[ 'a', 'b' ],'string trim')
  t.throws(() => {trimArrayOfStrings()},'throws on not array')
  t.throws(() => {trimArrayOfStrings([1])},'throws on not string')
  
  //isString
  t.deepEqual(isString(),false,'undefined')
  t.deepEqual(isString(1),false,'number')
  t.deepEqual(isString(''),true,'empty string')
  t.deepEqual(isString('abc'),true,'string')

  t.end()
  
})

    