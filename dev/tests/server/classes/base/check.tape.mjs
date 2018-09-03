
//process.alias = 'test check.mjs'
import test from 'tape'
import { Check } from '../../../../src/server/classes/base/check.mjs'

test('check.mjs', function (t) {

  t.throws(() => {const x = new Check({})},'throws on init bad list')
  t.doesNotThrow(() => {const x = new Check('abc')},'does not throw on good single')
  t.doesNotThrow(() => {const x = new Check(['abc','123'])},'does not throw on good list')
  const check = new Check('*')
  t.deepEqual(check.list,'*','allow all')
  t.deepEqual(check.inList('any'),true,'check allow all')
  check.list = ['some','some','someother',' ','']
  t.deepEqual(check.list, [ 'some', 'someother' ],'uniq & trim')
  t.deepEqual(check.inList('any'),false,'check allow some')
  t.deepEqual(check.config, { list: [ 'some', 'someother' ] },'get config')
  const old_stderr_write = process.stderr.write
  let intercepted = ''
  process.stderr.write = (s) => { intercepted = s }
  check.list = ''
  process.stderr.write = old_stderr_write
  t.deepEqual(intercepted.includes(' ALERT '),true,'alert on deny all')

  t.end()
})
