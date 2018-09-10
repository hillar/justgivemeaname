
process.alias = 'test router.mjs'
import test from 'tape'
import { Router } from '../../../../src/server/classes/base/router.mjs'
import { Route } from '../../../../src/server/classes/base/route.mjs'
test('router.mjs', async function (t) {
  const user = {uid:'test',roles:['any'],groups:['some']}
  const r = new Router(undefined, '*', '*', {test:{get:()=>{}}},{rr:new Route(null,'any','some',{get:()=>{}})})
  t.deepEqual(r.routes,[ 'test', 'rr' ],'routes')
  t.deepEqual(Object.keys(r.rr),Object.keys(r.test),'rr && test ')

  r.default = 'test'
  t.deepEqual(r.default,'test','default')

  let e
  let rr
  r.htmlroot = './'
  try {
    rr = await r.ping(user,'tape')
  } catch (e) {
    t.deepEqual(e.message,'','error')
  }
  t.deepEqual(rr,true,'ping')

  t.end()
})
