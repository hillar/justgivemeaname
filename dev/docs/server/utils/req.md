
# request utils

see [source](../../../../src/server/utils/req.mjs)


### ip
exports function `ip`, takes param  [`request`](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
returns object with remoteAddress and parsed HTTP forward headers

see also:  
https://tools.ietf.org/html/rfc7239
https://www.nginx.com/resources/wiki/start/topics/examples/forwarded/


### params

exports function `params`, takes param  [`request`](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
returns object of parsed request url params.

see also https://en.wikipedia.org/wiki/Query_string
