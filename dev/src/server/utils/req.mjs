
export function ip(req){
  if (!req || !req.socket || !req.headers ) return
  const ip = {}
  ip.remoteAddress = req.socket.remoteAddress
  /*
  https://tools.ietf.org/html/rfc7239
  https://www.nginx.com/resources/wiki/start/topics/examples/forwarded/
  X-Forwarded-For: 12.34.56.78, 23.45.67.89
X-Real-IP: 12.34.56.78
X-Forwarded-Host: example.com
X-Forwarded-Proto: https
Forwarded: for=12.34.56.78;host=example.com;proto=https, for=23.45.67.89
  */
  if (req.headers['forwarded']) {
    for (const b of req.headers['forwarded'].split(';') ) {
      for (const bb of b.split(',')){
        const kv = bb.split('=')
        if (kv[0] === 'for' || kv[0] === 'host')
        if (!ip.forwarded) ip.forwarded = []
        const tmp = {}
        tmp[kv[0]] = kv[1]
        ip.forwarded.push(tmp)
      }
    }
  }
  if (req.headers['x-real-ip']) {
    if (!ip.forwarded) ip.forwarded = []
    ip.forwarded.push({real:req.headers['x-real-ip']})
  }

  return ip
}

export function params(req){
  const kv = {}
  if (!req || !req.url) return kv
  const rawparams = decodeURIComponent(req.url).split('?')[1]
  if (!rawparams) return kv
  const params = rawparams.split('&')
  for (const param of params) {
    const tmp = param.split('=')
    const key = tmp[0]
    const value = tmp[1] || true
    kv[key] = value
  }
  return kv
}
