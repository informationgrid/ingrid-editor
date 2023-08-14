package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.services.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.format.DateTimeFormatter
import java.util.*

@RestController
//@RequestMapping(path = ["/api"])
class OgcRecordApiController @Autowired constructor(
        private val catalogService: CatalogService,
        private val documentService: DocumentService,
        private val ogcRecordService: OgcRecordService,
        private val researchService: ResearchService,
) : OgcRecordApi {


    override fun catalogs(principal: Principal): ResponseEntity<List<RecordCollection>> {
        val catalogs = ogcRecordService.getCatalogs(principal)
        return ResponseEntity.ok().body(catalogs.toList())
    }

    override fun catalogById(collectionId: String): ResponseEntity<RecordCollection> {
        val catalog = ogcRecordService.getCatalogById(collectionId)
        return ResponseEntity.ok().body(catalog)
    }


    //  bbox: String?, datetime: String?,
    override fun datasetsByCatalogId(collectionId: String, limit: Int?, offset: Int?, filter: String?, ): ResponseEntity<List<RecordOverview>> { // researchResponse
        val filterList = mutableListOf("document_wrapper.type != 'FOLDER'")
        if (!filter.isNullOrBlank()) filterList.add("document_wrapper.type = '${filter}'") // alternative filter -> document_wrapper.category
        val documentFilter = BoolFilter("AND", filterList, null, null, false)
        val (queryLimit, queryOffset) = ogcRecordService.pageLimitAndOffset(offset, limit)
        val query = ResearchQuery(null, documentFilter, pagination = ResearchPaging(1, queryLimit, queryOffset))
        val records: ResearchResponse = researchService.query(collectionId, query)
        val modifiedRecords = ogcRecordService.getRecords(records, collectionId)

        // header
        val totalHits = records.totalHits
        val responseHeaderLinks: HttpHeaders = ogcRecordService.getOgcRecordsPagingLinks(offset, limit, totalHits, collectionId)

        return ResponseEntity.ok().headers(responseHeaderLinks).body(modifiedRecords)
    }


    override fun deleteDatasetOfCatalog(principal: Principal, collectionId: String, recordId: String): ResponseEntity<Void> {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        wrapper.id?.let {
            documentService.deleteDocument(principal, collectionId, it)
        }
        return ResponseEntity.ok().build()
    }


    override fun createDataset(principal: Principal, collectionId: String, data: JsonNode, address: Boolean, publish: Boolean): ResponseEntity<JsonNode> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val parent = data.get(FIELD_PARENT) //data.get(FIELD_RESOURCES).get(FIELD_PARENT)
        val parentId = if (parent == null || parent.isNull) null else parent.asInt()
        // val data  = data.get(FIELD_RESOURCES).get(FIELD_PUBLISHED)
        val resultDoc = documentService.createDocument(principal, catalogId, data, parentId, address, publish)
        // addMetadataToDocument(resultDoc)

        val node = documentService.convertToJsonNode(resultDoc.document)
        return ResponseEntity.ok(node)
    }


    private fun addMetadataToDocument(documentData: DocumentData) {
        val wrapper = documentData.wrapper

        with(documentData.document) {
            data.put(FIELD_HAS_CHILDREN, wrapper.countChildren > 0)
            data.put(FIELD_PARENT, wrapper.parent?.id)
            data.put(FIELD_PARENT_IS_FOLDER, wrapper.parent?.type == "FOLDER")
            // TODO: next two fields not really necessary, since they can be simply evaluated from doc
            data.put(FIELD_CREATED_USER_EXISTS, createdByUser != null)
            data.put(FIELD_MODIFIED_USER_EXISTS, contentModifiedByUser != null)
            data.put(FIELD_PENDING_DATE, wrapper.pending_date?.format(DateTimeFormatter.ISO_DATE_TIME))
            data.put(FIELD_TAGS, wrapper.tags.joinToString(","))
            data.put(FIELD_RESPONSIBLE_USER, wrapper.responsibleUser?.id)
            wrapper.fingerprint?.let {
                data.put(FIELD_METADATA_DATE, it[0].date.toString())
            }
            hasWritePermission = wrapper.hasWritePermission
            hasOnlySubtreeWritePermission = wrapper.hasOnlySubtreeWritePermission
            wrapperId = wrapper.id
        }
    }



    override fun updateDataset(
            principal: Principal,
            collectionId: String,
            recordId: String,
            data: JsonNode,
            publishDate: Date?,
            publish: Boolean,
    ): ResponseEntity<JsonNode> {

        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        val id = wrapper.id!!

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val resultDoc = if (publish) {
            val doc = documentService.convertToDocument(data)
            documentService.publishDocument(principal, catalogId, id, doc, publishDate)
        } else {
            val doc = documentService.convertToDocument(data)
            documentService.updateDocument(principal, catalogId, id, doc)
        }

        val node = documentService.convertToJsonNode(resultDoc.document)
        return ResponseEntity.ok(node)
    }


    override fun datasetByRecordIdAndCatalogId(collectionId: String, recordId: String, format: String?, draft: Boolean?): ResponseEntity<ByteArray> {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        val id = wrapper.id!!

        val record = ogcRecordService.getRecord(collectionId, id, format, draft)

        val responseHeaders = HttpHeaders()
        if (format == "internal" || format.isNullOrBlank()) responseHeaders.add("Content-Type", "application/json")

        return ResponseEntity.ok().headers(responseHeaders).body(record)
    }
}