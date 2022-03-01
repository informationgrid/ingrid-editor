package schema

import io.kotest.core.spec.style.AnnotationSpec
import org.assertj.core.api.Assertions.assertThat
import schema.SchemaUtils.Companion.extractMissingRequiredFields
import schema.SchemaUtils.Companion.getJsonFileContent
import schema.SchemaUtils.Companion.validate

class McloudSchema : AnnotationSpec() {

    val schema = "/mcloud/schemes/mcloud.schema.json"

    @Test
    fun minimal() {
        val json = getJsonFileContent("/export/mcloud/mcloud.minimal.json")
        val result = validate(json, schema)
        assertThat(result.valid).isTrue
    }

    @Test
    fun more() {
        val json = getJsonFileContent("/export/mcloud/mcloud.json")
        val result = validate(json, schema)
        assertThat(result.valid).isTrue
    }

    @Test
    fun full() {
        val json = getJsonFileContent("/export/mcloud/mcloud.full.json")
        val result = validate(json, schema)
        assertThat(result.valid).isTrue
    }

    @Test
    fun fail() {
        val json = "{}"
        val result = validate(json, schema)
        assertThat(result.valid).isFalse
        val requiredErrors = extractMissingRequiredFields(result)

        assertThat(requiredErrors.size).isEqualTo(9)
        assertThat(requiredErrors).isEqualTo(
            listOf(
                "_uuid",
                "_type",
                "title",
                "description",
                "addresses",
                "mCloudCategories",
                "DCATThemes",
                "distributions",
                "license"
            )
        )
    }

}