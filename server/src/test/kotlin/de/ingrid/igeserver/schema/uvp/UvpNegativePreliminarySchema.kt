package de.ingrid.igeserver.schema.uvp

import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.ints.shouldBeExactly
import io.kotest.matchers.shouldBe

class UvpNegativePreliminarySchema : AnnotationSpec() {

    private val schema = "/uvp/schemes/negative-preliminary-examination.schema.json"
    private val requiredFields = listOf(
        "_uuid",
        "_type",
        "title",
        "description",
        "pointOfContact",
        "spatial",
        "decisionDate",
        "eiaNumbers",
        "uvpNegativeDecisionDocs"
    )

    @Test
    fun minimal() {
        val json = SchemaUtils.getJsonFileContent("/export/uvp/negative-preliminary.minimal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }

    @Test
    fun full() {
        val json = SchemaUtils.getJsonFileContent("/export/uvp/negative-preliminary.maximal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
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