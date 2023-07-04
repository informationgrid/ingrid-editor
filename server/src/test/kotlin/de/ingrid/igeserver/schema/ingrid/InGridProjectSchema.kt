package de.ingrid.igeserver.schema.ingrid

import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe

class InGridProjectSchema : AnnotationSpec() {

    private val schema = "/ingrid/schemes/project.schema.json"

    @Test
    fun minimal() {
        val json = SchemaUtils.getJsonFileContent("/export/ingrid/project.minimal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }

    @Test
    fun maximal() {
        val json = SchemaUtils.getJsonFileContent("/export/ingrid/project.maximal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }
}
