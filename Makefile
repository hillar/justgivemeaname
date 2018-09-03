prepare:
				cd dev ;\
				npm install

init: prepare

dev:
		 		cd dev ;\
		 		nodemon --experimental-modules src/server/index.mjs

serve: dev

test:
				cd dev ;\
				node tests/before.js; \
				tests/test-server.bash
	
build:
				cd dev ;\
				rollup -c rollup.config.json
