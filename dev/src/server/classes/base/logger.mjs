import { hostname } from 'os'
import { parse } from 'path'
import { LOGMETHODS } from '../../constants/logmethods'

const SEVERITYERROR = [
	'emerg',
	'alert',
	'crit',
	'err'
]

const SEVERITYLOG = [
	'warning',
	'notice',
	'info',
	'debug'
]


function nowAsJSON() {

	const now = new Date()
	return now.toJSON()

}

export class Logger {

	constructor() {

    // test if all LOGMETHODS exists here
    if ( ! ( LOGMETHODS.every( e => [ ...SEVERITYLOG, ...SEVERITYERROR ].includes( e ) ) ) ) throw new Error( 'LOGMETHODS do not match' )


		if ( ! process.alias ) {

			let pe = parse( process.argv[ 1 ] )
			process.alias = pe.base === 'index.js' ? pe.dir.split( '/' ).pop() : pe.base
			if (process.alias === 'bin') process.alias = pe.dir.split( '/' )[pe.dir.split( '/' ).length-2]
		}
		// TODO rfc5424 6.3.  STRUCTURED-DATA
		for ( const method of SEVERITYLOG ) {

			this[ method.toLowerCase() ] = ( ctx, ...msg ) => console.log( nowAsJSON(), hostname(), '[', process.alias, ':', process.pid, ']', method.toUpperCase(), ':', JSON.stringify( ctx ), ...msg )

		}
		for ( const method of SEVERITYERROR ) {

			this[ method.toLowerCase() ] = ( ctx, ...msg ) => console.error( nowAsJSON(), hostname(), '[', process.alias, ':', process.pid, ']', method.toUpperCase(), ':', JSON.stringify( ctx ), ...msg )

		}

	}

}
