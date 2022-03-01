package igeserver.schema

import io.kotest.core.spec.style.AnnotationSpec
import igeserver.schema.SchemaUtils.Companion.extractMissingRequiredFields
import igeserver.schema.SchemaUtils.Companion.getJsonFileContent
import igeserver.schema.SchemaUtils.Companion.validate
import io.kotest.matchers.ints.shouldBeExactly
import io.kotest.matchers.shouldBe

class UvpSchema : AnnotationSpec() {

    val schema = "/uvp/schemes/admission-procedure.schema.json"

    @Test
    fun minimal() {
        val json = getJsonFileContent("/export/uvp/admission-procedure.minimal.json")
        val result = validate(json, schema)
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
        val result = validate(json, schema)
        result.valid shouldBe false
        val requiredErrors = extractMissingRequiredFields(result)

        requiredErrors.size shouldBeExactly 9
        requiredErrors shouldBe listOf(
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
    }

}