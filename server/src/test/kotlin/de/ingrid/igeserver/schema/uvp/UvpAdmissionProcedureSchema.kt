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
        "eiaNumber",
        "prelimAssessment"
    )

    @Test
    fun minimal() {
        val json = SchemaUtils.getJsonFileContent("/export/uvp/admission-procedure.minimal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }

    /*@Test
    fun more() {
        val json = getJsonFileContent("/export/mcloud/mcloud.json")
        val result = validate(json)
        assertThat(result.valid).isTrue
    }

    @Test
    fun full() {
        val json = getJsonFileContent("/export/mcloud/mcloud.full.json")
        val result = validate(json)
        assertThat(result.valid).isTrue
    }
*/
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