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
package de.ingrid.igeserver.schema.ingrid_lfubayern

import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe

class InGridInformationSystemLfuBayern : AnnotationSpec() {

    private val schema = "/ingrid/schemes/lfubayern/information-system_lfubayern.schema.json"

    @Test
    fun minimal() {
        val json = SchemaUtils.getJsonFileContent("/export/ingrid/information-system.minimal.json").replaceFirst(
            "{",
            """
            { "dataSetURI": "myUri", "fees": "my fees", "resource": { "useConstraintsComments": "my useConstraintsComments" }, 
        """,
        )
        val result = SchemaUtils.validate(json, schema)
        result.size shouldBe 0
    }

    @Test
    fun negativeTest() =
        SchemaUtils.createNegativeTestByAddingInvalidField(schema, "/export/ingrid/information-system.minimal.json")
}
