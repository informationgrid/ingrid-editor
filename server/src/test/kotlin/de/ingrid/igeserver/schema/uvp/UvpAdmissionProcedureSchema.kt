package de.ingrid.igeserver.schema.uvp

import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.ints.shouldBeExactly
import io.kotest.matchers.shouldBe

class UvpAdmissionProcedureSchema : AnnotationSpec() {

    private val schema = "/uvp/schemes/admission-procedure.schema.json"
    private val requiredFields = listOf(
        "_uuid",
        "_type",
        "title",
        "description",
        "publisher",
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
        val json = SchemaUtils.getJsonFileContent("/export/uvp/admission-procedure.minimal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }

    @Test
    fun full() {
        val json = SchemaUtils.getJsonFileContent("/export/uvp/admission-procedure.maximal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }

    @Test
    fun emptySteps() {
        val json = SchemaUtils.getJsonFileContent("/export/uvp/admission-procedure.emptySteps.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe false
        
        val requiredErrors = SchemaUtils.extractMissingRequiredFields(result)
        requiredErrors.size shouldBeExactly requiredStepFields.size
        requiredErrors shouldBe requiredStepFields
    }

    @Test
    fun wrongFieldInStep() {
        // this json contains field "furtherDocs" which does not belong to step "publicHearing"
        val json = SchemaUtils.getJsonFileContent("/export/uvp/admission-procedure.wrongStepField.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe false
    }

    @Test
    fun fail() {
        val json = "{}"
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe false
        val requiredErrors = SchemaUtils.extractMissingRequiredFields(result)

        requiredErrors.size shouldBeExactly requiredFields.size
        requiredErrors shouldBe requiredFields
    }

}