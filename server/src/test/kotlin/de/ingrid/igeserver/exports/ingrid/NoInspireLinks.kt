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
package de.ingrid.igeserver.exports.ingrid

import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIdfNoInspireLinksExporter
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper

class NoInspireLinks : GeodatasetBase() {

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter =
            IngridIdfNoInspireLinksExporter(
                this.codelistHandler,
                this.uploadConfig,
                this.catalogService,
                this.documentService,
                this.documentWrapperRepository,
            )
    }

    private val themesJson: ObjectNode
        get() = jacksonObjectMapper()
            .readTree("""{ "themes": [ { "key": "303" }, { "key": "304" } ] }""".trimIndent()) as ObjectNode

    init {

        should("default IDF exporter uses INSPIRE links for mapped themes") {
            val result = exportJsonToXML(
                IngridIDFExporter(
                    this@NoInspireLinks.codelistHandler,
                    this@NoInspireLinks.uploadConfig,
                    this@NoInspireLinks.catalogService,
                    this@NoInspireLinks.documentService,
                    this@NoInspireLinks.documentWrapperRepository,
                ),
                "/export/ingrid/geo-dataset.minimal.sample.json",
                this@NoInspireLinks.themesJson,
            ).replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            // theme "304" (Bodennutzung) is mapped via mapToInspireLink and exported as anchor
            result shouldContain "<gmx:Anchor xlink:href=\"http://inspire.ec.europa.eu/theme/lu\">Bodennutzung</gmx:Anchor>"
            // theme "303" is not mapped and is exported without link
            result shouldContain "<gco:CharacterString>Boden</gco:CharacterString>"
        }

        should("export inspire keywords without links") {
            val result = exportJsonToXML(
                exporter,
                "/export/ingrid/geo-dataset.minimal.sample.json",
                this@NoInspireLinks.themesJson,
            ).replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            // inspire keywords are exported with their names...            result shouldContain "<gco:CharacterString>Bodennutzung</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>Boden</gco:CharacterString>"

            // ...but without any INSPIRE links
            result shouldNotContain "<gmx:Anchor xlink:href=\"http://inspire.ec.europa.eu/theme"
        }

        should("export earth observation (EO) themes without links") {
            val result = exportJsonToXML(
                exporter,
                "/export/ingrid/geo-dataset.minimal.sample.json",
                jacksonObjectMapper()
                    .readTree("""{ "themes": [ { "key": "202" } ] }""".trimIndent()) as ObjectNode,
            ).replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldContain "<gco:CharacterString>Bodenbedeckung</gco:CharacterString>"
            result shouldNotContain "<gmx:Anchor xlink:href=\"http://inspire.ec.europa.eu/theme/lc\">Bodenbedeckung</gmx:Anchor>"
        }
    }
}
