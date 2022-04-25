#!/bin/bash
if [[ -n "${WAIT_FOR_PARAM}" ]]; then
  /wait-for-it.sh ${WAIT_FOR_PARAM} -t 120
fi

echo "Adapt index.html to match context path"
sed -i -r "s@href=\"/\"@href=\"$CONTEXT_PATH/\"@" /app/resources/static/index.html
sed -i -r "s@contextPath\": \"/\"@contextPath\": \"$CONTEXT_PATH/\"@" /app/resources/static/assets/config.json

echo "Run original entrypoint command"
java -cp $( cat /app/jib-classpath-file ) $( cat /app/jib-main-class-file )
