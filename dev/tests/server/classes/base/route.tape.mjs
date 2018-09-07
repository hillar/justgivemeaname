
import test from 'tape'
import { Route } from '../../../../src/server/classes/base/route.mjs'
test('route.mjs', async function (t) {
  //t.fail('no tests for route.mjs source src/server/classes/base/route.mjs')
  const user = {uid:'test',roles:['any'],groups:['some']}
  const r  = new Route()
  t.deepEqual(r.settings, [ 'html', 'htmlroot', 'roles', 'groups' ],'settings')
  r.roles = 'any'
  r.groups = 'some'
  r.get = (req,res,user,logger) => {
    logger.log_info({user})
  }//logger.log_info(user)}
  t.deepEqual(r.config,{ html: undefined, htmlroot: undefined, roles: 'any', groups: 'some', get: { roles: 'any', groups: 'some' } },'config')

  let u
  try {
    u = await r.ping(user,'tape test')
  } catch (e) {
    t.deepEqual(e.message,'')
  }
  t.deepEqual(u,true)

  t.end()
})
