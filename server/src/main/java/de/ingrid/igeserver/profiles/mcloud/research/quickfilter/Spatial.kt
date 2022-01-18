package de.ingrid.igeserver.profiles.mcloud.research.quickfilter

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

    @Language("PostgreSQL")
    override val filter = """document1.type = 'mCloudDoc'
  AND jsonb_path_exists(jsonb_strip_nulls(data), '$.spatial')
  AND EXISTS(SELECT
             FROM jsonb_array_elements(data -> 'spatial') as s
             WHERE (s -> 'value' ->> 'lat1')\:\:numeric >= ? - $errorMargin
                 AND (s -> 'value' ->> 'lon1')\:\:numeric >= ? - $errorMargin
                 AND (s -> 'value' ->> 'lat2')\:\:numeric <= ? + $errorMargin
                 AND (s -> 'value' ->> 'lon2')\:\:numeric <= ? + $errorMargin
             )"""

    // L1: 49,916009°B1: 8,305664°L2: 50,335089°B2: 8,953857°
}
