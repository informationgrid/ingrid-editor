package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.db.DBApi
import de.ingrid.igeserver.db.FindOptions
import de.ingrid.igeserver.db.QueryType
import de.ingrid.igeserver.documenttypes.AbstractDocumentType
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.*

@Service
class DocumentService : MapperService() {
    @Autowired
    private lateinit var documentTypes: List<AbstractDocumentType>

    @Autowired
    private lateinit var dbService: DBApi

    @Throws(Exception::class)
    fun updateParent(dbDoc: String, parent: String?): JsonNode {
        val map = getJsonNode(dbDoc) as ObjectNode
        map.put(FIELD_PARENT, parent)
        return map
    }

    fun determineState(node: JsonNode): String {
        val draft = !node[FIELD_DRAFT].isNull
        val published = !node[FIELD_PUBLISHED].isNull
        return if (published && draft) {
            "PW"
        } else if (published) {
            "P"
        } else {
            "W"
        }
    }

    @Throws(Exception::class)
    fun getByDocId(id: String, type: String, withReferences: Boolean): JsonNode? {

        val query: MutableMap<String, String> = HashMap()
        query[FIELD_ID] = id
        val findOptions = FindOptions()
        findOptions.queryType = QueryType.exact
        findOptions.resolveReferences = withReferences
        val docs = dbService.findAll(type, query, findOptions)
        if (docs.totalHits != 1L) {
            log.error("A $type could not be found or is not unique for UUID: $id (got ${docs.totalHits})")
            throw RuntimeException("No unique document wrapper found")
        }
        return try {
            docs.hits[0]
        } catch (e: Exception) {
            log.error("Error getting document by ID: $id", e)
            null
        }
    }

    val documentWrapper: ObjectNode
        get() {
            val docWrapper = jacksonObjectMapper().createObjectNode()
                    .put(FIELD_DRAFT, null as String?)
                    .put(FIELD_PUBLISHED, null as String?)
            docWrapper.putArray(FIELD_ARCHIVE)

            return docWrapper
        }

    fun determineHasChildren(doc: JsonNode, type: String): Boolean {
        val id = doc[FIELD_ID].asText()
        val countMap = dbService.countChildrenFromNode(id, type)
        return if (countMap.containsKey(id)) {
            countMap[id]!! > 0
        } else false
    }

    fun getLatestDocument(doc: JsonNode): ObjectNode {
        val state = determineState(doc)
        val jsonNode = doc[FIELD_DRAFT]
        val docData: ObjectNode
        docData = if (jsonNode.isNull) {
            doc[FIELD_PUBLISHED] as ObjectNode
        } else {
            jsonNode as ObjectNode
        }
        docData.put(FIELD_STATE, state)
        if (!docData.has(FIELD_PARENT)) {
            docData.put(FIELD_PARENT, null as String?)
        }
        removeDBManagementFields(docData)

        // get latest references from links
        handleLatestLinkedDocs(docData)
        return docData
    }

    private fun handleLatestLinkedDocs(doc: ObjectNode) {
        val docType = doc[FIELD_DOCUMENT_TYPE].asText()
        val refType = getDocumentType(docType)
        refType!!.mapLatestDocReference(doc, this)
    }

    fun getDocumentType(docType: String): AbstractDocumentType? {
        var refType: AbstractDocumentType? = null

        // get linked fields
        for (type in documentTypes) {
            if (type.typeName == docType) {
                refType = type
                break
            }
        }
        return refType
    }

    companion object {
        private val log = LogManager.getLogger(DocumentService::class.java)
    }
}