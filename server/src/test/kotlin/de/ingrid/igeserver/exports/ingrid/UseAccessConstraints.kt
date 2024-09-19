/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.exports.ingrid

import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.IngridIdfExporterBkg
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.mockk.every

class UseAccessConstraints : GeodatasetBase() {

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter =
            IngridIdfExporterBkg(
                this.codelistHandler,
                this.config,
                this.catalogService,
                this.documentService,
            )
        every { catalogService.getProfileFromCatalog(any()) } returns
            DummyCatalog("ingrid-bkg")
    }

    init {

        should("export useLimitation without prefix") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "useLimitation": "bkg useLimitation constraint"
                   } }
                """,
            )

            result shouldContain USE_LIMITATION_CONSTRAINTS
        }
    }
}
