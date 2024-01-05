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
package de.ingrid.igeserver.schema.uvp

import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.ints.shouldBeExactly
import io.kotest.matchers.shouldBe

class UvpApprovalProcedureSchema : AnnotationSpec() {

    private val schema = "/uvp/schemes/approval-procedure.schema.json"
    private val requiredFields = listOf(
        "_uuid",
        "_type",
        "title",
        "description",
        "pointOfContact",
        "spatial",
        "receiptDate",
        "eiaNumbers",
        "prelimAssessment"
    )
    
    private val requiredStepFields = listOf(
        "disclosureDate",
        "announcementDocs",
        "applicationDocs",
        "publicHearingDate",
        "considerationDocs",
        "decisionDate"
    )

    @Test
    fun minimal() {
        val json = SchemaUtils.getJsonFileContent("/export/uvp/approval-procedure.minimal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }

    @Test
    fun full() {
        val json = SchemaUtils.getJsonFileContent("/export/uvp/approval-procedure.maximal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }

    @Test
    fun emptySteps() {
        val json = SchemaUtils.getJsonFileContent("/export/uvp/approval-procedure.emptySteps.json")
        shouldThrow<ValidationException> {
            val result = SchemaUtils.validate(json, schema)
            result.valid shouldBe false

            val requiredErrors = SchemaUtils.extractMissingRequiredFields(result)
            requiredErrors.size shouldBeExactly requiredStepFields.size
            requiredErrors shouldBe requiredStepFields
        }
    }

    @Test
    fun wrongFieldInStep() {
        // this json contains field "furtherDocs" which does not belong to step "publicHearing"
        val json = SchemaUtils.getJsonFileContent("/export/uvp/approval-procedure.wrongStepField.json")
        shouldThrow<ValidationException> {
            val result = SchemaUtils.validate(json, schema)
            result.valid shouldBe false
        }
    }

    @Test
    fun fail() {
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