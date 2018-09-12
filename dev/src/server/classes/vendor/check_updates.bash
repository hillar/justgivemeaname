#!/bin/bash

ls -p | grep '/'| while read vendor;
do

  if [ -f "${vendor}check_update" ]; then
    cd ${vendor}
    bash check_update
    cd ..
  else
    echo "warning: no updates check script for ${vendor}"
  fi

done
