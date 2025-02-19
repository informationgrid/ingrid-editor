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
            )
        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog("ingrid-bkg")
        every { catalogService.getCatalogById(any()).settings.config.language } returns "en"
        every { catalogService.getCatalogById(any()).settings.config.namespace } returns "https://registry.gdi-de.org/id/de.bund.bkg.csw"
        every { catalogService.getCatalogById(any()).settings.config.atomDownloadUrl } returns "https://my-atom-download-url"
    }

    init {

        should("export to ISO with English codelist values") {
            var result = exportJsonToXML(this@EnglishCatalog.exporter, "/export/bkg/geo-service.english.json")
            // replace generated UUIDs
            result = result
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldNotBe null
            result shouldBe SchemaUtils.getFileContent("/export/bkg/geo-service.english.expected.xml")
        }
    }
}
