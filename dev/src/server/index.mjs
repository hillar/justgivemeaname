import { createServer } from './classes/base/server'
import { StaticRoute } from './classes/routes/static'
import { ProxyRoute } from './classes/routes/proxy'
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
    'dist': new StaticRoute(null,null,null,'./static'),

    'proxy': new ProxyRoute(null,null,null,'api.hackertarget.com',80,'proxy'),
  }

})
//myserver.router.default = 'healtz'
//myserver.router.html.route = 'html'
myserver.listen()
