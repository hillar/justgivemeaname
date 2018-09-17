

const debug = require('debug')('req-rewrite');
const path = require('path')
const fs = require('fs')
const precinct = require('precinct');



const mkdir = (dir, done) => {
  function mkdir (dir, callback=()=>{}) {
    fs.mkdir(dir, (error) => {
      if (!error) {
        return callback()
      }

      if (error.code == 'ENOENT') {
        mkdir(path.dirname(dir), () => {
          mkdir(dir, callback)
        })
      }
      else {
        fs.stat(dir, (error, stats) => {
          if (error) callback(error)
          // skip if path already exists
          else if (stats.isDirectory()) callback()
          else callback(Error(`Could not create path: ${ path }`))
        })
      }
    })
  }

  mkdir(dir, done)
}




const start = 'ldapjs/lib/client/client.js'
const targetdir = '/Users/hillar/tmp/vendor-ldapjs/'

const root = process.cwd()

const visited = {}

function walkrequires (start, visited) {
  const options = {includeCore:false}


  //debug('start:',start)

  const directory = path.dirname(start)
  //debug('directory:',directory)

  dependencies = precinct.paperwork(start, options)
  //debug('dependencies',dependencies)

  for (const dep of dependencies){
    //debug('dep',dep)
    if (dep.includes('./')) {
      let fp = path.join(directory,dep)
      if (!dep.endsWith('.js')) {
        if (fs.existsSync(fp + '.js')) fp += '.js'
        else fp += '/index.js'
      }
      if (visited[fp]) {
                  //debug('visited',fp)
      } else {
                  debug('walk local',fp)
                  visited[fp] = []
                  walkrequires (fp, visited)
      }
    } else {
      // try to find real dep
      let fp
      if (fs.existsSync(path.join(root,dep,'index.js'))) fp = path.join(dep,'index.js')
      else if (fs.existsSync(path.join(root,dep,dep+'.js'))) fp = path.join(dep,dep+'.js')
      if (!fp) {
        if (fs.existsSync(path.join(root,dep,'package.json'))) {
           let main = JSON.parse(fs.readFileSync(path.join(root,dep,'package.json'),'utf8')).main
           //debug('main',main)
           if (main) {
             if (fs.existsSync(path.join(root,dep,main))) {
               fp = path.join(dep,main)
               //debug('real fp', fp)
             }
           }
        }
      }
      if (!fp) throw new Error('no entry for '+ dep)
      let back = []
      for (let i in directory.split('/')) back.push('..')
      const realdep = back.join('/') + '/' + fp
      visited[start].push({dep,realdep})
      if (!visited[fp]) {
        debug('walk package',dep,fp)
        visited[fp] = []
        walkrequires (fp, visited)
      }
      //let file = fs.readFileSync(start,'utf8')
      //file.replace(dep,realdep)
      //debug('replace',dep,start,realdep)
      //console.dir(file)
    }
  }
}

visited[start] = []
walkrequires (start,visited)

debug('--------------- total',Object.keys(visited).length)
//debug('visited',visited)
for (const filename of Object.keys(visited)){
  //debug('filename',filename)
  let file = fs.readFileSync(filename,'utf8')
  for (const r of visited[filename]){
    const regex = new RegExp("('"+r.dep+"')")
    file = file.replace(regex,"'"+r.realdep+"'")
    //debug('repalcing',r.dep, r.realdep)
  }
  const dir = path.dirname(filename)
  mkdir(path.join(targetdir,dir),()=>{
    fs.writeFileSync(path.join(targetdir,filename),file)
    //debug('writing',path.join(targetdir,filename))
  })
}
