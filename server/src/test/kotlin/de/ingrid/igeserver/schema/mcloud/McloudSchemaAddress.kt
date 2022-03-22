package de.ingrid.igeserver.schema.mcloud

import de.ingrid.igeserver.schema.SchemaUtils
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
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe false
        val requiredErrors = SchemaUtils.extractMissingRequiredFields(result)

        requiredErrors.size shouldBeExactly requiredFields.size
        requiredErrors shouldBe requiredFields
    }
}