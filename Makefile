install:  
				cd dev ;\
				npm install
				
dev: 		
		 		cd dev ;\
				npm update
		 		nodemon --experimental-modules src/server/index.mjs

prod:
				cd dev ;\
				rollup -c rollup.config.json 