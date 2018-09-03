
# Class Base

see [source](../../../../src/server/classes/base/base.mjs)

exports `class Base`

On create new accepts optional `logger`. Can be anything, what has at least [LOGMETHODS](../../constants/logmethods.md), otherwise throws.
If not given uses [default logger](./logger.md)

Attributes :
* `typeof` :  returns current constructor name
* `logger` :  returns logger
* `settings` : returns array of settable attributes
* `config` : returns object of settings with values


Functions:
* `readConfig` : applies new values to settings
