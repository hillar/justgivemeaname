export function trimArrayOfStrings(a) {

    return [ ...( new Set( a.map( s => ( s.trim().length > 0 ) ? s.trim() : undefined ) ) ) ].filter( i => (!(i === undefined)) )

}

export function isString(s) {
  return Object.prototype.toString.call( s ) === '[object String]'
}