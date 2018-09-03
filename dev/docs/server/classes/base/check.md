
# Class Check

>  check is it listed or not

see [source](../../../../src/server/classes/base/check.mjs)

exports `class Check`  

`Check` extends [`Base`](./base.md). On create new accepts optional `list` and `logger`.
If `list` not given, `inList` returns default `false`. List can be *string* or *array*  of strings.
Logs ALERT if nonempty list is set to **''**, as it effectively denies all.

Settings:

* `list` : string || array of strings. If **'*'** then `inList` returns always true.

Functions:

* `inList` : returns true if some of input exists in `list`, else false.
