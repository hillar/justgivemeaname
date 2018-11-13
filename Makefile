prepare:
				cd dev ;\
				npm install

init: prepare

devel:
		 		cd dev ;\
		 		node_modules/nodemon/bin/nodemon.js --experimental-modules src/server/index.mjs

demo:
				cd dev ;\
				node_modules/nodemon/bin/nodemon.js --experimental-modules src/server/index.mjs --auth-server=ipa.demo1.freeipa.org --auth-base=dc=demo1,dc=freeipa,dc=org --auth-binduser=admin --auth-bindpass=Secret123

serve: devel

test:
				cd dev ;\
				node tests/before.js; \
				tests/test-server.bash

build:
				cd dev ;\
				node_modules/rollup/bin/rollup -c rollup.config.js
