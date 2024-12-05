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
package de.ingrid.igeserver.schema.ingrid

import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.schema.SchemaUtils
import de.ingrid.igeserver.schema.SchemaUtils.Companion.validate
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe

class InGridGeoDatasetHmdkSchema : AnnotationSpec() {

    private val schema = "/ingrid/schemes/hmdk/geo-dataset_hmdk.schema.json"

    @Test
    fun minimal() {
        val json = SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.minimal.json").replaceFirst(
            "\"properties\": {",
            """"properties": {"publicationHmbTG": true, """,
        ).replaceFirst("{", """{ "informationHmbTG": [{"key": "1"}], """)
        val result = validate(json, schema)
        result.size shouldBe 0
    }

    @Test
    fun negativeTest() =
        SchemaUtils.createNegativeTestByAddingInvalidField(schema, "/export/ingrid/geo-dataset.minimal.json")

    @Test
    fun negativeTestWrongProperty() {
        val json = SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.minimal.json").replaceFirst(
            "\"properties\": {",
            """"properties": {"publicationHmbTGXXX": true, """,
        ).replaceFirst("{", """{ "informationHmbTG": [{"key": "1"}], """)
        println(json)
        val exception = shouldThrow<ValidationException> { validate(json, schema) }
        (exception.data?.get("error") as List<*>).size shouldBe 1
    }
}
