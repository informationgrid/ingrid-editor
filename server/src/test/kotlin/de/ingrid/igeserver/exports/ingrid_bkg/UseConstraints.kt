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
import io.mockk.every

class UseConstraints : GeodatasetBase() {

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

        should("export useConstraint - copyright") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "useConstraintsBkg": { "key": "10" }
                   } }
                """,
            )

            result shouldContain USE_CONSTRAINTS_COPYRIGHT
        }

        should("export useConstraint - copyright & license") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "useConstraintsBkg": { "key": "12" }
                   } }
                """,
            )

            result shouldContain USE_CONSTRAINTS_COPYRIGHT
        }

        should("export useConstraint - intellectualPropertyRights") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "useConstraintsBkg": { "key": "13" }
                   } }
                """,
            )

            result shouldContain USE_CONSTRAINTS_INTELLECTIONALPROPERTYRIGHTS
        }

        should("export useConstraint - license") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "useConstraintsBkg": { "key": "11" }
                   } }
                """,
            )

            result shouldContain USE_CONSTRAINTS_OTHER
        }

        should("export useConstraint - restricted") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "useConstraintsBkg": { "key": "14" }
                   } }
                """,
            )

            result shouldContain USE_CONSTRAINTS_RESTRICTED
        }

        should("export useConstraint - restricted with comment and source") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "useConstraintsBkg": { "key": "14" },
                        "useConstraintsBkgComment": "bkg use comment",
                        "useConstraintsBkgSource": "bkg use source"
                   } }
                """,
            )

            result shouldContain USE_CONSTRAINTS_RESTRICTED_WITH_COMMENT_SOURCE
        }

        should("export useConstraint with long text") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "useConstraintsBkg": { "key": "15" },
                        "useConstraintsBkgComment": "bkg use comment",
                        "useConstraintsBkgSource": "bkg use source"
                   } }
                """,
            )

            result shouldContain USE_CONSTRAINTS_WITH_LONGTEXT
        }

        should("export useConstraint with long text and no comment") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "useConstraintsBkg": { "key": "15" },
                        "useConstraintsBkgSource": "bkg use source"
                   } }
                """,
            )

            result shouldContain USE_CONSTRAINTS_WITH_LONGTEXT_NO_COMMENT
        }

        should("export useConstraint with long text and no source") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "useConstraintsBkg": { "key": "15" },
                        "useConstraintsBkgComment": "bkg use comment"
                   } }
                """,
            )

            result shouldContain USE_CONSTRAINTS_WITH_LONGTEXT_NO_SOURCE
        }

        should("export useConstraint with just long text") {
            val result = exportGeoDataset(
                """{ "resource": {
                        "useConstraintsBkg": { "key": "15" }
                   } }
                """,
            )

            result shouldContain USE_CONSTRAINTS_WITH_JUST_LONGTEXT
        }
    }
}
