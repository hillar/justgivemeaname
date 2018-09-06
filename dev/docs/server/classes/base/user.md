
# User

> common user object with **uid, roles, groups, ssn, fn, ln, ou ,manager ,emails ,phones**

see [source](../../../../src/server/classes/base/user.mjs)

exports class `User` and function `createUser`

extends [`Base`](./base.md)

Class `User`needs **`uid`, `roles`, `groups`**,
throws if `uid` not string or `roles`, `groups` not string || array of strings.
Logs ALERT if empty.
Logs ERROR if `fn` and `ln` are empty.
Logs INFO is `ssn` and `emails` are empty.  

Function `createUser` needs object to create `User`, throws if not given
