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
package de.ingrid.igeserver.schema.mcloud

import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.ints.shouldBeExactly
import io.kotest.matchers.shouldBe

class McloudSchemaAddress : AnnotationSpec() {

    private val schema = "/mcloud/schemes/address.schema.json"
    private val requiredFields = listOf("_uuid", "_type", "organization", "contact")


    @Test
    fun minAddress() {
        val json = SchemaUtils.getJsonFileContent("/export/mcloud/mcloud-address.minimal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }

    @Test
    fun fullAddress() {
        val json = SchemaUtils.getJsonFileContent("/export/mcloud/mcloud-address.full.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }

    @Test
    fun failAddress() {
        val json = "{}"
        shouldThrow<ValidationException> {
            val result = SchemaUtils.validate(json, schema)
            result.valid shouldBe false
            val requiredErrors = SchemaUtils.extractMissingRequiredFields(result)

            requiredErrors.size shouldBeExactly requiredFields.size
            requiredErrors shouldBe requiredFields
        }
    }
}