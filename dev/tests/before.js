const glob = require('glob')
const fs = require('fs')
const path = require('path')
const files = glob.sync('src/server/**/*.mjs')

for (const src of files) {
  const name = src.split('/').pop()
  const test = src.replace('src/','tests/').replace('.mjs','.tape.mjs')
  if (!fs.existsSync(test)){
    console.log('no test for', src, 'creating ..')
    fs.writeFileSync(test,`
process.alias = 'test ${name}'
import test from 'tape'
import * as that from '../../../${src}'
test('${name}', function (t) {
  //t.fail('no tests for ${name} source ${src}')
  t.deepEqual(that,'')
  t.end()
})

    `)
  }
}
for (const src of files) {
  const doc = src.replace('src/','docs/').replace('.mjs','.md')
  const name = src.split('/').pop()
  if (!fs.existsSync(doc)){
    console.error('no doc for', src)
    fs.writeFileSync(doc,`
# ${name}

see [source](../../${src})
    `)
  }
}
