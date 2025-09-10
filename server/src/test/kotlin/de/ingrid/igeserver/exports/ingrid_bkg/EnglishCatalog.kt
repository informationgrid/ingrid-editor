/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.IngridIdfExporterBkg
import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.core.spec.Spec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every

class EnglishCatalog : GeodatasetBase() {

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter =
            IngridIdfExporterBkg(
                this.codelistHandler,
                this.uploadConfig,
                this.catalogService,
                this.documentService,
                this.documentWrapperRepository,
            )
        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog("ingrid-bkg")
        every { catalogService.getCatalogById(any()).settings.config.language } returns "en"
        every { catalogService.getCatalogById(any()).settings.config.namespace } returns "https://registry.gdi-de.org/id/de.bund.bkg.csw"
        every { catalogService.getCatalogById(any()).settings.config.atomDownloadUrl } returns "https://my-atom-download-url"
    }

    init {

        should("export geoservice to ISO with English codelist values") {
            var result = exportJsonToXML(this@EnglishCatalog.exporter, "/export/bkg/geo-service.english.json")
            // replace generated UUIDs
            result = result
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/bkg/geo-service.english.expected.xml")
        }

        should("export geodataset to ISO with English codelist values") {
            var result = exportJsonToXML(this@EnglishCatalog.exporter, "/export/bkg/geo-dataset.english.json")
            // replace generated UUIDs
            result = result
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/bkg/geo-dataset.english.expected.xml")
        }
    }
}
