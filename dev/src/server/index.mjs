import { createServer } from './classes/base/server'
import { createStaticRoute } from './classes/routes/static'
import { createProxyRoute } from './classes/routes/proxy'
const myserver = createServer({

  roles: '*',

  groups: '*',
  /*
  // by default freeipa is used as Identity server
  // or just write your own simple function
  auth: async (username,password) => {
    const getuserfromsomewhere = await new Promise((resolve,reject) => {
      resolve({uid:username,roles:[],groups:[]})
    })
    return getuserfromsomewhere
  },
  */
  router:
    { user:
      { get: async (req,res, user, logger) => {
          logger.log_info({returning:user})
          res.write(JSON.stringify(user))
        }
      },
      dist: createStaticRoute({ root:'./static' }),
      hackertarget: createProxyRoute({ host:'api.hackertarget.com', port:80 }),
    }
})
myserver.router.default = 'dist'
myserver.listen()
