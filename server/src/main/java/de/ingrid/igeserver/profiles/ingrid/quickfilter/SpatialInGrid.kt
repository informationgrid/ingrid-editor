/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.profiles.ingrid.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.intellij.lang.annotations.Language
import org.springframework.stereotype.Component

@Component
class SpatialInGrid : QuickFilter() {
    override val id = "ingridSelectSpatial"
    override val label = "<group label will be used>"

    override val parameters: List<String> = emptyList()

    final val errorMargin = 0.001
    override val filter = ""

    @Language("PostgreSQL")
    override fun filter(parameter: List<*>?) = """jsonb_path_exists(jsonb_strip_nulls(data), '$.spatial.references') AND (jsonb_typeof(data -> 'spatial' -> 'references') = 'array')
  AND EXISTS(SELECT
             FROM jsonb_array_elements(data -> 'spatial' -> 'references') as s
             WHERE CAST((s -> 'value' ->> 'lat1') as numeric) >= ${parameter?.get(0)} - $errorMargin
                 AND CAST((s -> 'value' ->> 'lon1') as numeric) >= ${parameter?.get(1)} - $errorMargin
                 AND CAST((s -> 'value' ->> 'lat2') as numeric) <= ${parameter?.get(2)} + $errorMargin
                 AND CAST((s -> 'value' ->> 'lon2') as numeric) <= ${parameter?.get(3)} + $errorMargin
             )"""

    // L1: 49,916009°B1: 8,305664°L2: 50,335089°B2: 8,953857°
}
