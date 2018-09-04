export function trimArrayOfStrings(a) {

    return [ ...( new Set( a.map( s => ( s.trim().length > 0 ) ? s.trim() : undefined ) ) ) ].filter( i => (!(i === undefined)) )

}