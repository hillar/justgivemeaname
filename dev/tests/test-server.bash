#!/bin/bash
echo $(pwd)

ls tests/server/*/*.tape.mjs| while read f; 
do 
node --experimental-modules ${f} &> /tmp/tape || echo "*** failed ${f} \n $(cat /tmp/tape)"
ok=$?
echo "ok ${ok} "

done
