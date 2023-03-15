package de.ingrid.igeserver.schema.ingrid

import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe

class InGridDataCollectionSchema : AnnotationSpec() {

    private val schema = "/ingrid/schemes/data-collection.schema.json"

    @Test
    fun minimal() {
        val json = SchemaUtils.getJsonFileContent("/export/ingrid/data-collection.minimal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }

    @Test
    fun maximal() {
        val json = SchemaUtils.getJsonFileContent("/export/ingrid/data-collection.maximal.json")
        val result = SchemaUtils.validate(json, schema)
        result.valid shouldBe true
    }
}
