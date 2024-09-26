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

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.exports.ingrid.exportJsonToJson
import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.IngridLuceneExporterBkg
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.mockk.every

class LuceneExport : GeodatasetBase() {

    private lateinit var exporterLucene: IngridLuceneExporterBkg

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporterLucene =
            IngridLuceneExporterBkg(
                this.codelistHandler,
                this.config,
                this.catalogService,
                this.documentService,
            )
        every { catalogService.getProfileFromCatalog(any()) } returns
            DummyCatalog("ingrid-bkg")
    }

    init {

        should("export administrative area") {
            val result = exportGeoDatasetLucene()

            // "Ansprechpartner MD" is mapped to "Ansprechpartner"
            result shouldContain """"t02_address.identificationinfo_administrative_area_value" : "Hessen""""
        }

        should("export bkg use constraint") {
            val result = exportGeoDatasetLucene(
                """{ "resource": {
                        "useConstraintsBkg": { "key": "2" }
                   } }
                """,
            )

            result shouldContain """"object_use_constraint.license_key" : [ "2" ]"""
            result shouldContain """"object_use_constraint.license_value" : [ "Die Daten sind urheberrechtlich geschützt. Der Datensatz wird geldleistungsfrei mit der Lizenz zur freien Nutzung (https://sg.geodatenzentrum.de/web_public/gdz/lizenz/webatlasde_freie_nutzung.pdf) zur Verfügung gestellt. Der Quellenvermerk ist zu beachten." ]"""
        }
    }

    private fun exportGeoDatasetLucene(additionalJson: String? = null): String =
        exportJsonToJson(
            exporterLucene,
            "/export/ingrid/geo-dataset.minimal.sample.json",
            additionalJson?.let {
                jacksonObjectMapper()
                    .readTree(additionalJson.trimIndent()) as ObjectNode
            },
        ).replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
}
