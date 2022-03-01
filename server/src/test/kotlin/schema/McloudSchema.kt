package schema

import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.validators.JsonSchemaValidator
import io.kotest.core.spec.style.AnnotationSpec
import io.mockk.mockk
import net.pwall.json.schema.output.BasicOutput
import org.assertj.core.api.Assertions.assertThat

class McloudSchema : AnnotationSpec() {

    private val documentService: DocumentService = mockk()

    @Test
    fun minimal() {
        val json = getJsonFileContent("/export/mcloud/mcloud.minimal.json")
        val result = validate(json)
        assertThat(result.valid).isTrue
    }

    @Test
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

    @Test
    fun fail() {
        val json = "{}"
        val result = validate(json)
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

    private fun extractMissingRequiredFields(result: BasicOutput) = result.errors
        ?.filter { it.error.indexOf("Required property") == 0 }
        ?.map { it.error.substring(IntRange(it.error.indexOf("\"") + 1, it.error.lastIndexOf("\"") - 1)) }!!

    private fun validate(json: String) =
        JsonSchemaValidator(documentService).validate("/mcloud/schemes/mcloud.schema.json", json)!!

    private fun getJsonFileContent(file: String) = this::class.java.getResource(file)!!.readText(Charsets.UTF_8)
}