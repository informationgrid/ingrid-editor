/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_lubw.pipes

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PreCreatePayload
import org.springframework.stereotype.Service

@Service
class PreCreateIdentifierInit : Filter<PreCreatePayload> {
    override val profiles = arrayOf("ingrid-lubw")

    override fun invoke(
        payload: PreCreatePayload,
        context: Context,
    ): PreCreatePayload {
        val doc = payload.document
        if (doc.type == "InGridGeoDataset") {
            doc.data.put("identifier", doc.uuid)
        }
        return payload
    }
}
