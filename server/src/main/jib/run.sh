#!/bin/bash
if [[ -n "${WAIT_FOR_PARAM}" ]]; then
  /wait-for-it.sh ${WAIT_FOR_PARAM} -t 120
fi

echo "Run original entrypoint command"
java -cp $( cat /app/jib-classpath-file ) $( cat /app/jib-main-class-file )