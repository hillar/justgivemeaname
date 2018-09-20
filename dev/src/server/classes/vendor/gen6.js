/*

"you wanted a banana but you got the gorilla holding it and the whole jungle too"

" I thought using loops was cheating, so I programmed my own using samples. I then thought using samples was cheating, so I recorded real drums. I then thought that programming it was cheating, so I learned to play drums for real. I then thought using bought drums was cheating, so I learned to make my own. I then thought using premade skins was cheating, so I killed a goat and skinned it. I then thought that that was cheating too, so I grew my own goat from a baby goat. I also think that is cheating, but I’m not sure where to go from here. I haven’t made any music lately, what with the goat farming and all."

*/

const espree = require('espree')
const {Parser} = require("acorn")
const walk = require("acorn-walk")
const { generate } = require('astring')
const {transform} = require('lebab')
const debug = require('debug')('req-rewrite');
const path = require('path')
const fs = require('fs')
const precinct = require('precinct');



const mkdir = (dir, done) => {
  // if multiple paths need to be created
  // will be called recursively
  //debug('mkdir',dir)
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
const targetdir = '/Users/hillar/tmp/kalamaja'

const root = process.cwd()

const visited = {}

function walkrequires (start, visited,name) {
  const options = {includeCore:false}

  name = name || start
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
      visited[start].push({name,dep,realdep})
      if (!visited[fp]) {
        debug('walk package',dep,fp)
        visited[fp] = []
        walkrequires (fp, visited, dep)
      }
    }
  }
}

visited[start] = []
walkrequires (start,visited)

debug('--------------- total',Object.keys(visited).length)
let funccalls = {}
//debug('visited',visited)
for (const filename of Object.keys(visited)){
  //debug('filename',filename)
  let file = fs.readFileSync(filename,'utf8')
  let name
  for (const r of visited[filename]){
    const regex = new RegExp("('"+r.dep+"')")
    let rdp = r.realdep.slice(0, -3)
    file = file.replace(regex,"'"+rdp+"'")
    name = r.name
    //debug('repalcing',r.dep, r.realdep)
  }
  let code = Parser.parse(file,{ ecmaVersion: 7 })
  funccalls[filename] = {}
  funccalls[filename].name = name
  funccalls[filename].functions = []
  funccalls[filename].calls = []
  funccalls[filename].modules = visited[filename]

  walk.simple(code, {
        FunctionDeclaration: (node) => {
            //debug(node.type,node.id)
            debug('function ',node.id.name)
            funccalls[filename].functions.push(node.id.name)
            walk.simple(node,{CallExpression: (n) => {
                //debug('infunc ',node.id.name, n.type, n.callee)
                if (n.callee.type === 'Identifier') {
                  funccalls[filename].calls.push({func:node.id.name,callee:n.callee.name})
                  debug('-- infunc ',node.id.name, n.callee.name)
                } else {
                  if (n.callee.object && n.callee.object.name) {
                    funccalls[filename].calls.push({func:node.id.name,callee:n.callee.object.name})
                      debug('------infunc called',node.id.name, n.callee.object.name)
                  }

                }
              }
            })
          }
  })

  let pretty = generate(code)


  let code6 = transform(pretty,['arrow',
  'let',
  'for-of',
  'for-each',
  'arg-rest',
  'arg-spread',
  'obj-method',
  'obj-shorthand',
  'no-strict',
  'commonjs',
  'class',
  'template',
  'default-param',
  'exponent',
  'multi-var',
  'includes',
  'destruct-param'])
  let rfn = path.join(targetdir,filename.slice(0,-3)+'.mjs')
  let ofn = path.join(targetdir,filename)
  let dotfn = path.join(targetdir,filename.slice(0,-3)+'.depes.json')

  mkdir(path.dirname(rfn),()=>{
    debug('filename',rfn)
    fs.writeFileSync(rfn,code6.code)
    fs.writeFileSync(ofn,pretty)
    fs.writeFileSync(dotfn,JSON.stringify(funccalls[filename]))
    fs.writeFileSync(targetdir+'/depes.json',JSON.stringify(funccalls,null,4))
  })

}
