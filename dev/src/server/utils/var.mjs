export function trimArrayOfStrings(a) {

    return [ ...( new Set( a.map( s => ( s.trim().length > 0 ) ? s.trim() : undefined ) ) ) ].filter( i => (!(i === undefined)) )

}

export function isString(s) {
  return Object.prototype.toString.call( s ) === '[object String]'
}


export function isFunction(fn) {
  return (Object.prototype.toString.call(fn) === '[object Function]')
}

export function isAsyncFunction(fn) {
  return (Object.prototype.toString.call(fn) === '[object AsyncFunction]')
}

export function isFn(fn) {
  return (Object.prototype.toString.call(fn) === '[object Function]' || Object.prototype.toString.call(fn) === '[object AsyncFunction]')
}

/*
Returns a name property of the Object constructor function **that created the instance object**.
*/

export function creatorName(that) {
  return Object.getPrototypeOf(that).constructor.name
}

/*
? standardised way to tell the type of a javascript object
*/

export function objectType(that) {
  return Object.prototype.toString.call(that)
}

export function is(that) {
  return [Object.getPrototypeOf(that).constructor.name,Object.prototype.toString.call(that)].join(':')
}
