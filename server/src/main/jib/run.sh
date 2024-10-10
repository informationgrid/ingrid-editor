#!/bin/sh
if [[ -n "${WAIT_FOR_PARAM}" ]]; then
  TIMEOUT=120
  if [[ -n "${WAIT_FOR_PARAM_TIMEOUT}" ]]; then
    TIMEOUT=${WAIT_FOR_PARAM_TIMEOUT}
  fi
  /wait-for-it.sh ${WAIT_FOR_PARAM} -t ${TIMEOUT} -- echo "Continue"
fi

echo "Adapt index.html to match context path"
sed -i -r "s@href=\"/\"@href=\"$CONTEXT_PATH/\"@" /app/resources/static/index.html
sed -i -r "s@contextPath\": \"/\"@contextPath\": \"$CONTEXT_PATH/\"@" /app/resources/static/assets/config.json

if [[ -n "${UMAMI_URL}" ]]; then
  sed -i "/<head>/a\  <script defer src=\"$UMAMI_URL\" data-website-id=\"$UMAMI_ID\"></script>" /app/resources/static/index.html
fi

if [[ -n "${BROKER_URL}" ]]; then
  sed -i -r "s@brokerUrl\":.*@brokerUrl\": \"$BROKER_URL\",@" /app/resources/static/assets/config.json
fi

if [[ -n "${SHOW_TEST_BADGE}" ]]; then
  sed -i -r "s@showTestBadge\":.*@showTestBadge\": $SHOW_TEST_BADGE,@" /app/resources/static/assets/config.json
fi

if [[ -n "${MAP_TILE_URL}" ]]; then
  sed -i -r "s@mapTileUrl\":.*@mapTileUrl\": \"$MAP_TILE_URL\",@" /app/resources/static/assets/config.json
fi

if [[ -n "${MAP_ATTRIBUTION}" ]]; then
  sed -i -r "s@mapAttribution\":.*@mapAttribution\": \"$MAP_ATTRIBUTION\",@" /app/resources/static/assets/config.json
fi

if [[ -n "${MAP_WMS_URL}" ]]; then
  sed -i -r "s@mapWMSUrl\":.*@mapWMSUrl\": \"$MAP_WMS_URL\",@" /app/resources/static/assets/config.json
fi

if [[ -n "${MAP_WMS_LAYERS}" ]]; then
  sed -i -r "s@mapWMSLayers\":.*@mapWMSLayers\": \"$MAP_WMS_LAYERS\",@" /app/resources/static/assets/config.json
fi

if [[ -n "${NOMINATIM_URL}" ]]; then
  sed -i -r "s@nominatimUrl\":.*@nominatimUrl\": \"$NOMINATIM_URL\",@" /app/resources/static/assets/config.json
fi

if [[ -n "${SHOW_ACCESSIBILITY_LINK}" ]]; then
  sed -i -r "s@showAccessibilityLink\":.*@showAccessibilityLink\": $SHOW_ACCESSIBILITY_LINK,@" /app/resources/static/assets/config.json
fi

if [[ -n "${ALLOW_OVERWRITE_ON_VERSION_CONFLICT}" ]]; then
  sed -i -r "s@allowOverwriteOnVersionConflict\":.*@allowOverwriteOnVersionConflict\": $ALLOW_OVERWRITE_ON_VERSION_CONFLICT,@" /app/resources/static/assets/config.json
fi

if [[ -n "${ENABLE_AI}" ]]; then
  sed -i -r "s@openAISearch\":.*@openAISearch\": $ENABLE_AI@" /app/resources/static/assets/config.json
fi

echo "Run original entrypoint command"
java -cp $( cat /app/jib-classpath-file ) $( cat /app/jib-main-class-file )
