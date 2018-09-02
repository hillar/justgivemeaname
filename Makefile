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
				#node --experimental-modules tests/server/*/*.tape.mjs; \
				#node --experimental-modules tests/server/*/*.lab.mjs;\
				# TODO fix mjs tests ;\
				#ls tests/server/*/*.tape.mjs|while read f; do node --experimental-modules ${f}; done

build:
				cd dev ;\
				rollup -c rollup.config.json 