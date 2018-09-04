import { trimArrayOfStrings } from '../../utils/var'
import { Base } from './base'

export class Check extends Base {

	constructor( checklist, logger ) {

		super( logger )

		this.inList = () => {

			return false

		}

		Object.defineProperty( this, '_list', {
			enumerable: false,
			configurable: false,
			writable: true
		} )

		this.list = checklist

	}


	get list () {

		if ( Array.isArray( this._list ) && this._list.length === 1 ) return this._list[ 0 ]
		else return this._list

	}

	set list( checklist ) {

		let orig = checklist
		//noop
		if ( checklist === null || checklist === undefined ) return
		//if not string or array, die
		if ( ! ( Array.isArray( checklist ) || Object.prototype.toString.call( checklist ) === '[object String]' ) ) throw new Error( Object.getPrototypeOf( this ).constructor.name + ' checklist :: not string nor array ' + typeof checklist )
		if ( checklist === '*' ) {

			this.inList = ( memberOf ) => {

				//if not string or array, die, even we allow all
				if ( ! ( Array.isArray( memberOf ) || Object.prototype.toString.call( memberOf ) === '[object String]' ) ) throw new Error( Object.getPrototypeOf( this ).constructor.name + ' inList :: not string nor array ' + typeof memberOf )
				return true

			}
			this._list = '*'
			return

		}
		if ( Object.prototype.toString.call( checklist ) === '[object String]' ) checklist = [ checklist ]
		if ( Array.isArray( checklist ) ) checklist = trimArrayOfStrings( checklist )
		else throw new Error( Object.getPrototypeOf( this ).constructor.name + ' :: checklist not array' + typeof checklist )
		if ( Array.isArray( checklist ) && checklist.length > 0 ) {

			this._list = checklist
			this.inList = ( memberOf ) => {

				//if not string or array, die
				if ( ! ( Array.isArray( memberOf ) || Object.prototype.toString.call( memberOf ) === '[object String]' ) ) throw new Error( Object.getPrototypeOf( this ).constructor.name + ' :: not string nor array ' + typeof memberOf )
				if ( ! Array.isArray( memberOf ) ) memberOf = [ memberOf ]
				return this._list.some( ( v ) => {

					return memberOf.indexOf( v ) >= 0

				} )

			}

		} else {

			this._list = undefined
			this.inList = () => {

				return false

			}
			this.log_alert( { 'empty checklist, deny all': orig } )

		}

	}

}
