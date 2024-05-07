/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import de.ingrid.igeserver.DummyCatalog
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
    
    every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog()
}

data class MockDocument(
    val id: Int? = null,
    val uuid: String,
    val template: String? = null,
    val parent: Int? = null,
    val type: String? = null,
    val organization: String? = null,
    val personName: String? = null,
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
            if (document.template != null) convertToDocument(SchemaUtils.getJsonFileContent(document.template)).apply { 
                wrapperId = document.id
                uuid = document.uuid
                data.put("_parent", document.parent)
                if (document.organization != null) data.put("organization", document.organization)
                if (document.personName != null) data.put("lastName", document.personName)
            }
            else throw EmptyResultDataAccessException(1)
        }
        if (document.id != null) {
            every { documentService.getWrapperById(document.id.toInt()) } answers {
                mockedDocumentSimple(document.id, document)
            }
        }
    }
    every { documentService.getIncomingReferences(any(), any()) } answers { emptySet() }
    every { documentService.findChildrenDocs(any(), any(), any()) } answers { FindAllResults(0, emptyList()) }
}

fun mockedDocumentSimple(id: Number, document: MockDocument): DocumentWrapper {
    return createDocumentWrapper().apply {
        this.id = id.toInt()
        type = document.type ?: "testDocType"
        parent = document.parent?.let {
            DocumentWrapper().apply {
                this.id = it
            }
        }
        uuid = document.uuid
    }
}


fun createDocumentWrapper() = DocumentWrapper().apply { type = "testDocType" }
