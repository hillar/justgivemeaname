prepare:
				cd dev ;\
				npm install

init: prepare

devel:
		 		cd dev ;\
		 		node_modules/nodemon/bin/nodemon.js --experimental-modules src/server/index.mjs

serve: devel

test:
				cd dev ;\
				node tests/before.js; \
				tests/test-server.bash

build:
				cd dev ;\
				rollup -c rollup.config.js
