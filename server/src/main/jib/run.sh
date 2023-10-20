#!/bin/bash
if [[ -n "${WAIT_FOR_PARAM}" ]]; then
  /wait-for-it.sh ${WAIT_FOR_PARAM} -t 120
fi

echo "Adapt index.html to match context path"
sed -i -r "s@href=\"/\"@href=\"$CONTEXT_PATH/\"@" /app/resources/static/index.html
sed -i -r "s@contextPath\": \"/\"@contextPath\": \"$CONTEXT_PATH/\"@" /app/resources/static/assets/config.json

if [[ -n "${BROKER_URL}" ]]; then
  sed -i -r "s@brokerUrl\":.*@brokerUrl\": \"$BROKER_URL\",@" /app/resources/static/assets/config.json
fi

if [[ -n "${SHOW_TEST_BADGE}" ]]; then
  sed -i -r "s@showTestBadge\":.*@showTestBadge\": \"$SHOW_TEST_BADGE\",@" /app/resources/static/assets/config.json
fi

if [[ -n "${MAP_TILE_URL}" ]]; then
  sed -i -r "s@mapTileUrl\":.*@mapTileUrl\": \"$MAP_TILE_URL\",@" /app/resources/static/assets/config.json
fi

if [[ -n "${NOMINATIM_URL}" ]]; then
  sed -i -r "s@nominatimUrl\":.*@nominatimUrl\": \"$NOMINATIM_URL\",@" /app/resources/static/assets/config.json
fi

if [[ -n "${SHOW_ACCESSIBILITY_LINK}" ]]; then
  sed -i -r "s@showAccessibilityLink\":.*@showAccessibilityLink\": \"$SHOW_ACCESSIBILITY_LINK\",@" /app/resources/static/assets/config.json
fi

if [[ -n "${ENABLE_AI}" ]]; then
  sed -i -r "s@openAISearch\":.*@openAISearch\": \"$ENABLE_AI\",@" /app/resources/static/assets/config.json
fi

echo "Run original entrypoint command"
java -cp $( cat /app/jib-classpath-file ) $( cat /app/jib-main-class-file )
