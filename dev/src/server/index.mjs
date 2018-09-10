import { createServer } from './classes/base/server'
import { StaticRoute } from './classes/routes/static'
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
    { healtz:
    { get: (req,res, user, logger) => {
      console.dir('got logger',logger)
      logger.log_info({returning:user})
      res.write('TEST '+JSON.stringify({health:'ok'}))
      }
    },
    'html': new StaticRoute(null,null,null,'./static'),
  }

})
myserver.router.default = 'healtz'
myserver.router.html.route = 'html'
myserver.listen()
