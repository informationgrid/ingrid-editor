/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
import de.ingrid.igeserver.imports.getFile
import de.ingrid.igeserver.imports.internal.InternalImporter
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.core.spec.style.AnnotationSpec

class InternalImportMigrations : AnnotationSpec() {

    @Test
    fun migrateGeodatasetFrom110ToCurrent() {
        val importer = InternalImporter()
        val result = importer.run("test", null, getFile("ingrid/import/internal_ingrid_110.json"), mutableMapOf())
        println(result.toString())

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/internal_ingrid_110_to_current_expected.json"),
        )
    }
}
