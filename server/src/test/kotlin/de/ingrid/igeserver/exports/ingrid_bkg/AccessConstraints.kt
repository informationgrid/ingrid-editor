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
package de.ingrid.igeserver.exports.ingrid_bkg

import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.IngridIdfExporterBkg
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.every

class AccessConstraints : GeodatasetBase() {

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

        should("export only accessConstraint INSPIRE") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "accessConstraints": [{ "key": "6" }]
                   } }
                """,
            )

            result shouldContain ACCESS_CONSTRAINTS_INSPIRE
        }

        should("export only accessConstraint BKG") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "accessConstraintsBkg": { "key": "2" }
                   } }
                """,
            )

            result shouldContain ACCESS_CONSTRAINTS_ONLY_BKG
        }

        should("export only accessConstraint - template copyright") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "accessConstraintsBkg": { "key": "5" }
                   } }
                """,
            )

            result shouldContain ACCESS_CONSTRAINTS_BKG_TEMPLATE_COPYRIGHT
        }

        should("export only accessConstraint - template license") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "accessConstraintsBkg": { "key": "6" }
                   } }
                """,
            )

            result shouldContain ACCESS_CONSTRAINTS_BKG_TEMPLATE_LICENSE
        }

        should("export only accessConstraint - template copyright & license") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "accessConstraintsBkg": { "key": "7" }
                   } }
                """,
            )

            result shouldContain ACCESS_CONSTRAINTS_BKG_TEMPLATE_COPYRIGHTANDLICENSE
        }

        should("export only accessConstraint - template intellectualPropertyRights") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "accessConstraintsBkg": { "key": "8" }
                   } }
                """,
            )

            result shouldContain ACCESS_CONSTRAINTS_BKG_TEMPLATE_INTELLECTUALPROPERTYRIGHTS
        }

        should("export only accessConstraint - template restricted") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "accessConstraintsBkg": { "key": "9" }
                   } }
                """,
            )

            result shouldContain ACCESS_CONSTRAINTS_BKG_TEMPLATE_RESTRICTED
        }

        should("export only accessConstraint - no apply") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "accessConstraintsBkg": { "key": "1" }
                   } }
                """,
            )

            result shouldContain ACCESS_CONSTRAINTS_BKG_NO_APPLY
        }

        should("export accessConstraints after INSPIRE one") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "accessConstraints": [{ "key": "6" }],
                        "accessConstraintsBkg": { "key": "1" }
                   } }
                """,
            )

            result shouldContain ACCESS_CONSTRAINTS_BKG_AFTER_INSPIRE
        }

        should("export accessConstraints with comments") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "accessConstraintsBkg": { "key": "1" },
                        "accessConstraintsBkgComment": "access bkg comments"
                   } }
                """,
            )

            result shouldContain ACCESS_CONSTRAINTS_BKG_WITH_COMMENTS
        }

        should("not export accessConstraints when only comments") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "accessConstraintsBkgComment": "access bkg comments"
                   } }
                """,
            )

            result shouldNotContain "access bkg comments"
        }
    }
}
