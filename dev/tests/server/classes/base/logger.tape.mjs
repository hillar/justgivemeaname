
//process.alias = 'test logger.mjs'
import test from 'tape'
import { Logger } from '../../../../src/server/classes/base/logger.mjs'

test('logger.mjs', function (t) {

  const log = new Logger()
  const methods = [ 'warning', 'notice', 'info', 'debug', 'emerg', 'alert', 'crit', 'err' ]
  t.deepEqual(Object.keys(log),methods,'methods list')

  const old_stdout_write = process.stdout.write
  let intercepted = ''
  for (const method of ['warning', 'notice', 'info', 'debug']){
    const ctx = {test:method}
    process.stdout.write = (s) => { intercepted = s }
    log[method](ctx,'1234','abc')
    process.stdout.write = old_stdout_write
    t.deepEqual(intercepted.split(':')[5].split('}')[0],'"'+method+'"','log '+method)
  }

  const old_stderr_write = process.stderr.write
  for (const method of ['emerg', 'alert', 'crit', 'err']){
    const ctx = {test:method}
    process.stderr.write = (s) => { intercepted = s }
    log[method](ctx,'1234','abc')
    process.stderr.write = old_stderr_write
    t.deepEqual(intercepted.split(':')[5].split('}')[0],'"'+method+'"','log '+method)
  }

  t.end()

})
