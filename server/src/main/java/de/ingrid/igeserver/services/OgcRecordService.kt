package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import org.json.simple.JSONObject
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Service
import java.security.Principal
import java.time.OffsetDateTime
import java.util.*



@Service
class OgcRecordService @Autowired constructor(
        private val catalogService: CatalogService,
        private val exportService: ExportService,
) {
    val apiHost = "http://localhost:8550"

    fun pageLimitAndOffset(offset: Int?, limit: Int?): LimitAndOffset {
        val defaultLimit = 10
        val maxLimit = Int.MAX_VALUE
        var queryLimit: Int = limit ?: defaultLimit
        if (queryLimit > maxLimit) queryLimit = maxLimit
        val queryOffset: Int = if (offset === null) 0 else { if ( offset < 0 ) 0 else offset }
        return LimitAndOffset(queryLimit, queryOffset)
    }

    fun getOgcRecordsPagingLinks(offset: Int?, limit: Int?, totalHits: Int, catalogId: String): HttpHeaders {
        val (queryLimit, queryOffset) = pageLimitAndOffset(offset, limit)

        val nextOffset: Int = queryOffset + queryLimit
        val prevOffset: Int = if (queryOffset < queryLimit) 0 else queryOffset - queryLimit

        val baseUrl = "<${apiHost}/collections/${catalogId}/items"
        val limitString = if (limit !== null) "?limit=${queryLimit}" else ""
        val questionMarkOrAmpersand = ( if (limit == null && offset !== null) "?" else if (limit !== null && offset !== null) "&" else "")

        val selfLink = baseUrl + limitString + questionMarkOrAmpersand + ( if (offset !== null) "offset=${queryOffset}" else "" ) + ">; rel='self'; type='application/json'"
        val prevLink = baseUrl + (if ( limitString.isEmpty() ) "?" else "$limitString&") + "offset=$prevOffset" + ">; rel='prev'; type='application/json'"
        val nextLink = baseUrl + (if ( limitString.isEmpty() ) "?" else "$limitString&") + "offset=$nextOffset" + ">; rel='next'; type='application/json'"

        val responseHeaders = HttpHeaders()
        responseHeaders.add("Link", selfLink)
        if(totalHits > nextOffset) responseHeaders.add("Link", nextLink)
        if(queryOffset != 0) responseHeaders.add("Link", prevLink)

        return responseHeaders
    }

    fun getCatalogs(principal: Principal): List<RecordCollection> {
        val catalogs = catalogService.getCatalogsForPrincipal(principal)
        return catalogs.map{ catalog -> mapCatalogToRecordCollection(catalog) }
    }

    fun getCatalogById(catalogId: String): RecordCollection {
        val catalog = catalogService.getCatalogById(catalogId)
        return mapCatalogToRecordCollection(catalog)
    }

    private fun mapCatalogToRecordCollection(catalog: Catalog): RecordCollection {
        val links = "${apiHost}/collections/${catalog.identifier}/items"
        return RecordCollection(
                id = catalog.identifier,
                title = catalog.name,
                description = catalog.description,
                links = links,
                itemType = "record",
                type = "Collection",
                modelType = catalog.type,
                created = catalog.created,
                updated = catalog.modified,
        )
    }

    fun getRecord(catalogId: String, id: Int, format: String?, draft: Boolean?): ByteArray {
        val options = ExportRequestParameter(
                id = id,
                exportFormat = format ?: "internal",
                useDraft = draft ?: false
        )
        val record = exportService.export(catalogId, options)

        return prepareExportData(record, options)
    }

    private fun prepareExportData(record: ExportResult, options: ExportRequestParameter): ByteArray{
        val convertedRecord: ByteArray  = if (options.exportFormat == "internal"){
            val jsonNode = jacksonObjectMapper().readValue(record.result, JsonNode::class.java)
            val published = if (options.useDraft) jsonNode.get("resources").get("draft") else jsonNode.get("resources").get("published")
            published.toString().toByteArray()
        } else {
            record.result
        }
        return convertedRecord
    }


    fun getRecords(records: ResearchResponse, catalogId: String): List<RecordOverview>{
        return records.hits.map{ record -> mapRecordOverview(record, catalogId)}
    }

    private fun mapRecordOverview(record: Result, catalogId: String): RecordOverview {
        val dataset =  "${apiHost}/collections/${catalogId}/items/${record._uuid}"
        return RecordOverview(
                title = record.title,
                data = dataset,
                id = record._uuid,
                created = record._created,
                updated = record._contentModified,
        )
    }

}