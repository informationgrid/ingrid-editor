package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.intellij.lang.annotations.Language
import org.springframework.stereotype.Component

@Component
class Spatial : QuickFilter() {
    override val id = "mCloudSelectSpatial"
    override val label = "<group label will be used>"

    override val implicitFilter = listOf("selectDocMCloud")
    override val parameters: List<String> = emptyList()

    final val errorMargin = 0.001
    override val filter = ""

    @Language("PostgreSQL")
    override fun filter(parameter: List<*>?) = """jsonb_path_exists(jsonb_strip_nulls(data), '$.spatial') AND (jsonb_typeof(data -> 'spatial') = 'array')
  AND EXISTS(SELECT
             FROM jsonb_array_elements(data -> 'spatial') as s
             WHERE CAST((s -> 'value' ->> 'lat1') as numeric) >= ${parameter?.get(0)} - $errorMargin
                 AND CAST((s -> 'value' ->> 'lon1') as numeric) >= ${parameter?.get(1)} - $errorMargin
                 AND CAST((s -> 'value' ->> 'lat2') as numeric) <= ${parameter?.get(2)} + $errorMargin
                 AND CAST((s -> 'value' ->> 'lon2') as numeric) <= ${parameter?.get(3)} + $errorMargin
             )"""

    // L1: 49,916009°B1: 8,305664°L2: 50,335089°B2: 8,953857°
}
