package de.ingrid.igeserver.persistence.postgresql

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.model.meta.BehaviourType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.persistence.postgresql.jpa.ModelRegistry
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.*
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.spring.SpringListener
import org.assertj.core.api.Assertions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig

@SpringBootTest(classes = [IgeServer::class])
@TestPropertySource(locations = ["classpath:application-test.properties"])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts=["/test_data.sql"], config=SqlConfig(encoding="UTF-8"))
class EntityAttributeTest : AnnotationSpec() {

    override fun listeners(): List<SpringListener> { return listOf(SpringListener) }

    @Autowired
    private lateinit var modelRegistry: ModelRegistry

    @Autowired
    private lateinit var dbService: PostgreSQLDatabase

    @Test
    fun `get meta data`() {
        val documentType = modelRegistry.getTypeInfo(Document::class)
        val catalogField = modelRegistry.getFieldInfo(documentType!!, "catalog")
        val catalogType = modelRegistry.getTypeInfo(catalogField!!.relatedEntityType!!)

        Assertions.assertThat(catalogType!!.type).isEqualTo(catalogField.relatedEntityType)
        Assertions.assertThat(modelRegistry.getTypeInfo(Catalog::class)!!.type).isEqualTo(catalogType.type)
    }

    @Test
    fun `get catalog`() {
        val id = 100

        val loadedDoc = dbService.find(CatalogInfoType::class, id.toString())!!

        Assertions.assertThat(loadedDoc.get("db_id")?.intValue()).isEqualTo(id)
        Assertions.assertThat(dbService.getRecordId(loadedDoc)).isEqualTo(id.toString())

        Assertions.assertThat(loadedDoc.get("id")?.textValue()).isEqualTo("test_catalog")
        Assertions.assertThat(loadedDoc.get("name")?.textValue()).isEqualTo("Test Catalog")
        Assertions.assertThat(loadedDoc.get("description")?.textValue()).isEqualTo("Test Catalog Description")
        Assertions.assertThat(loadedDoc.get("type")?.textValue()).isEqualTo("uvp")

        dbService.removeInternalFields(loadedDoc)

        Assertions.assertThat(loadedDoc.has("db_id")).isFalse
    }

    @Test
    fun `get behaviour`() {
        val id = 202

        val loadedDoc = dbService.find(BehaviourType::class, id.toString())!!

        Assertions.assertThat(loadedDoc.get("db_id")?.intValue()).isEqualTo(id)
        Assertions.assertThat(dbService.getRecordId(loadedDoc)).isEqualTo(id.toString())

        Assertions.assertThat(loadedDoc.get(FIELD_ID)?.textValue()).isEqualTo("plugin.address.title")
        Assertions.assertThat(loadedDoc.get("active")?.booleanValue()).isEqualTo(true)
        Assertions.assertThat(loadedDoc.get("data")?.isObject).isTrue
        Assertions.assertThat(loadedDoc.get("data")?.get("template")?.textValue()).isEqualTo("address template")
        Assertions.assertThat(loadedDoc.has("type")).isFalse
        Assertions.assertThat(loadedDoc.has("dataFields")).isFalse

        dbService.removeInternalFields(loadedDoc)

        Assertions.assertThat(loadedDoc.has("db_id")).isFalse
    }

    @Test
    fun `get document wrapper`() {
        val id = 2002

        val loadedDoc = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            dbService.find(DocumentWrapperType::class, id.toString())!!
        }

        Assertions.assertThat(loadedDoc.get("db_id")?.intValue()).isEqualTo(id)
        Assertions.assertThat(dbService.getRecordId(loadedDoc)).isEqualTo(id.toString())

        Assertions.assertThat(loadedDoc.get(FIELD_ID)?.textValue()).isEqualTo("4e91e8f8-1e16-c4d2-6689-02adc03fb352")
        Assertions.assertThat(loadedDoc.get(FIELD_PARENT)?.textValue()).isEqualTo("8f891e4e-161e-4d2c-6869-03f02ab352dc")
        Assertions.assertThat(loadedDoc.get(FIELD_DOCUMENT_TYPE)?.textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(loadedDoc.get(FIELD_CATEGORY)?.textValue()).isEqualTo("address")

        // DBApi.find() does not resolve references
        Assertions.assertThat(loadedDoc.get(FIELD_DRAFT)?.textValue()).isEqualTo("1000")
        Assertions.assertThat(loadedDoc.get(FIELD_PUBLISHED)?.textValue()).isEqualTo("1001")
        Assertions.assertThat(loadedDoc.get(FIELD_ARCHIVE)?.isArray).isTrue
        Assertions.assertThat(loadedDoc.get(FIELD_ARCHIVE).size()).isEqualTo(1)
        Assertions.assertThat(loadedDoc.get(FIELD_ARCHIVE).get(0).textValue()).isEqualTo("1002")

        dbService.removeInternalFields(loadedDoc)

        Assertions.assertThat(loadedDoc.has("db_id")).isFalse
    }
}