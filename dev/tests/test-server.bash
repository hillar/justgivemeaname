#!/bin/bash
echo $(pwd)

#ls tests/server/*/*.tape.mjs| while read f;

find tests/server -type file -name '*.tape.mjs' | while read f;
do

node --experimental-modules ${f} &> /tmp/tape
ok=$?

if [ ${ok} -eq 0 ]; then
  echo "OK ${f} "
else
  echo "* * * failed ${f}"
  echo "$(cat /tmp/tape)"
  echo "* * * * * * * * *"
fi

done
