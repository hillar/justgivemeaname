
# Class Logger

see [source](../../../../src/server/classes/base/logger.mjs)

exports `class Logger`


output functions to `stderr`
* emerg
* alert
* crit
* err


output functions to `stdout`
* warning
* notice
* info
* debug

params for all functions:
* ctx
* ...messages

output format:
* timestamp ( now )
* hostname
* process.alias
* process.pid
* severity ( method name )
* ctx as JSON string
* ...messages

`log.emerg({test:"emerg"},1234,'abc')`

`2018-09-03T08:30:06.730Z localhost [ logger.tape.mjs : 32220 ] EMERG : {"test":"emerg"} 1234 abc`

see
* [Severity levels](https://en.wikipedia.org/wiki/Syslog#Severity_level)
* [rfc5424](https://tools.ietf.org/html/rfc5424#section-6.2.1)
* [PCI DSS 10.3](https://pcinetwork.org/forum/index.php?threads/pci-dss-3-0-10-3-record-at-least-the-following-audit-trail-entries-for-all-system-components-for-each-event.739/)
