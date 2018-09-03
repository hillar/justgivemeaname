
# Class Base

> base for all, what needs logging and settings 

see [source](../../../../src/server/classes/base/base.mjs)

exports `class Base`

On create new accepts optional `logger`. Can be anything, what has at least [LOGMETHODS](../../constants/logmethods.md), otherwise throws.
If not given uses [default logger](./logger.md)

Attributes :
* `typeof` :  RO current constructor name
* `logger` : logger
* `settings` : RO array of settable attributes
* `config` : RO object of settings with values


Functions:
* `readConfig` : applies new values to settings
