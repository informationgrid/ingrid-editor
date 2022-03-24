package de.ingrid.igeserver.schema.uvp

import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.ints.shouldBeExactly
import io.kotest.matchers.shouldBe

class UvpSpatialAndLineSchema : AnnotationSpec() {

    private val schema = "/uvp/schemes/spatial-or-line.schema.json"
    private val requiredFields = listOf(
        "_uuid",
        "_type",
        "title",
        "description",
        "publisher",
        "spatial",
        "receiptDate",
        "eiaNumbers"
    )

    @Test
    fun minimal() {
        val json = SchemaUtils.getJsonFileContent("/export/uvp/spatial-planning-procedure.minimal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }

    @Test
    fun full() {
        val json = SchemaUtils.getJsonFileContent("/export/uvp/spatial-planning-procedure.maximal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
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