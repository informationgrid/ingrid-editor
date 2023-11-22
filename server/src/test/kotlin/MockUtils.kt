import de.ingrid.igeserver.exports.convertToDocument
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogConfig
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogSettings
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.schema.SchemaUtils
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import io.mockk.every
import org.springframework.dao.EmptyResultDataAccessException

fun mockCatalog(catalogService: CatalogService) {
    every { catalogService.getCatalogById(any()) } answers {
        Catalog().apply {
            identifier = "test-catalog"
            settings = CatalogSettings().apply {
                config = CatalogConfig().apply {
                    //namespace = "namespace"
                    atomDownloadUrl = "https://dev.informationgrid.eu/interface-search/dls/service/"
                }
            }
        }
    }
}

data class MockDocument(
    val id: Number? = null,
    val uuid: String,
    val template: String? = null,
    val parent: Int? = null,
    val type: String? = null,
)

fun initDocumentMocks(documents: List<MockDocument>, documentService: DocumentService) {
    documents.forEach { document ->
        every {
            documentService.getLastPublishedDocument(
                "test-catalog",
                document.uuid,
                any(),
            )
        } answers {
            if (document.template != null) convertToDocument(SchemaUtils.getJsonFileContent(document.template))
            else throw EmptyResultDataAccessException(1)
        }
        if (document.id != null) {
            every { documentService.getWrapperByDocumentId(document.id.toInt()) } answers {
                createDocumentWrapper().apply {
                    id = document.id.toInt()
                    type = document.type ?: "testDocType"
                    parent = document.parent?.let {
                        DocumentWrapper().apply {
                            id = it
                        }
                    }
                    uuid = document.uuid
                }
            }
        }
    }
    every { documentService.getIncomingReferences(any(), any()) } answers { emptySet() }
    every { documentService.findChildrenDocs(any(), any(), any()) } answers { FindAllResults(0, emptyList()) }
}


fun createDocumentWrapper() =
    DocumentWrapper().apply {
        type = "testDocType"
    }
