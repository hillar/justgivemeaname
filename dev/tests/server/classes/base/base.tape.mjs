
//process.alias = 'test base.mjs'
import test from 'tape'
import { Base } from '../../../../src/server/classes/base/base.mjs'
import { Logger } from '../../../../src/server/classes/base/logger.mjs'

test('base.mjs', function (t) {

  t.deepEqual(Object.keys(Base),[],'no object keys')

  t.throws(() => {const x = new Base({})},'throws on init bad logger')
  t.doesNotThrow(() => {const x = new Base(new Logger())},'does not throw on good logger')

  // test extending
  class ExtendedBase extends Base {
    constructor(...params) {
      super(...params)
    }

    set test (testvalue) {
      Object.defineProperty(this, '_test', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: testvalue
      })
    }
    get test () { return this._test }
    // will be ignored
    set __test (testvalue) {
      Object.defineProperty(this, '_testx', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: testvalue
      })
    }
    get __test () { return this._testx }

  }

  let extended = new ExtendedBase()
  t.deepEqual(Object.keys(extended.logger) , [ 'warning', 'notice', 'info', 'debug', 'emerg', 'alert', 'crit', 'err' ],'default logger')
  t.equal(extended.typeof , 'ExtendedBase','typeof extended Base')
  t.deepEqual(extended.settings, ['test'],'get settings')
  t.deepEqual(extended.config, { test: undefined },'get config')
  const old_stdout_write = process.stdout.write
  let intercepted = ''
  process.stdout.write = (s) => { intercepted = s }
  extended.readConfig({test:1234, __test:'abc'})
  extended.__test = 'kala'
  process.stdout.write = old_stdout_write
  t.deepEqual(extended.config, { test: 1234 },'read new config')
  t.deepEqual(intercepted.split(':')[5].split('}')[0],'{"configChanges"','log read config')
  t.throws(() => { extended.logger = {} },'throws on set bad logger')
  t.deepEqual(extended.__test, 'kala','setting name with ___ ')

  t.end()

})
