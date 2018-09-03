
# Class RolesAndGroups

> holds two check lists: *roles* and *groups*. Base for all, what need permissions

see [source](../../../../src/server/classes/base/rolesandgroups.mjs)

`RolesAndGroups` extends [`Base`](./base.md) and uses [`Check`](./check.md)

Settings:
* roles: string || array of strings.
* groups: string || array of strings.

Functions:
* allowed: params `role(s)` and `group(s)`, returns true if exists in both checks.
* isingroups
* isinroles
