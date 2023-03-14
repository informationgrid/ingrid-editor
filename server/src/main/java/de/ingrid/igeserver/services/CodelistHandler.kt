package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.model.CodeList
import de.ingrid.codelists.model.CodeListEntry
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.CodelistRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class CodelistHandler @Autowired constructor(
    private val codelistRepo: CodelistRepository,
    private val catalogRepo: CatalogRepository,
    private val codeListService: CodeListService
) {

    companion object {
        fun toCodelistEntry(id: String, german: String, data: String? = null): JsonNode {
            return jacksonObjectMapper().createObjectNode().apply {
                put("id", id)
                if (data != null) put("data", data)
                set<JsonNode>("localisations", jacksonObjectMapper().createObjectNode().apply {
                    put("de", german)
                })
            }
        }

    }

    fun removeAndAddCodelist(catalogId: String, codelist: Codelist) {
        codelistRepo.deleteByCatalog_IdentifierAndIdentifier(catalogId, codelist.identifier)
        codelistRepo.flush()
        codelistRepo.save(codelist)
    }
    
    fun removeAndAddCodelists(catalogId: String, codelists: List<Codelist>) {
        codelists.forEach { 
            codelistRepo.deleteByCatalog_IdentifierAndIdentifier(catalogId, it.identifier)
        }
        codelistRepo.flush()
        codelistRepo.saveAll(codelists)
    }
    
    fun getCodelists(ids: List<String>): List<CodeList> {

        return codeListService.codeLists
            .filter { codelist -> ids.contains(codelist.id) }

    }

    fun fetchCodelists(): List<CodeList>? {

        return codeListService.updateFromServer()

    }

    fun getCatalogCodelists(catalogId: String): List<CodeList> {

        return codelistRepo
            .findAllByCatalog_Identifier(catalogId)
            .map {
                CodeList().apply {
                    id = it.identifier
                    name = it.name
                    description = it.description
                    defaultEntry = it.defaultEntry
                    entries = it.data?.map { entry ->
                        CodeListEntry().apply {
                            id = entry.get("id").asText()
                            description =
                                if (entry.get("description") == null || entry.get("description").isNull) null else entry.get(
                                    "description"
                                ).asText()
                            data =
                                if (entry.get("data") == null || entry.get("data").isNull) null else entry.get("data")
                                    .asText()
                            fields = ObjectMapper().convertValue(
                                entry.get("localisations"),
                                jacksonTypeRef<Map<String, String>>()
                            )
                        }
                    } ?: mutableListOf()
                }
            }
    }

    fun getCatalogCodelistValue(catalogId: String, codelistId: String, key: String): String? {
        return getCatalogCodelists(catalogId)
            .find { it.id == codelistId }
            ?.entries
            ?.find { it.id == key }
            ?.fields?.get("de")
    }  

    fun getCatalogCodelistKey(catalogId: String, codelistId: String, value: String): String? {
        return getCatalogCodelists(catalogId)
            .find { it.id == codelistId }
            ?.entries
            ?.find { it.getField("de") == value }
            ?.id
    }    
    
    fun getCodelistEntry(codelistId: String, key: String): CodeListEntry? {
        return getCodelists(listOf(codelistId))
            .find { it.id == codelistId }
            ?.entries
            ?.find { it.id == key }
    } 
    
    fun getCodelistValue(codelistId: String, key: String): String? {
        return getCodelists(listOf(codelistId))
            .find { it.id == codelistId }
            ?.entries
            ?.find { it.id == key }
            ?.fields?.get("de")
    }

    fun updateCodelist(catalogId: String, id: String, codelist: Codelist): Codelist? {
        val dbCodelist = codelistRepo.findByCatalog_IdentifierAndIdentifier(catalogId, id)
        codelist.id = dbCodelist.id
        codelist.catalog = catalogRepo.findByIdentifier(catalogId)
        return codelistRepo.save(codelist)
    }

    fun getCodeListEntryId(listId: String, value: String?, language: String?): String? {
        return codeListService.getCodeListEntryId(listId, value, language)
    }
    fun getCodeListEntryIdMatchingData(listId: String, dataValue: String): String? {
        return codeListService.getCodeList(listId)
            .entries.find { it.data.contains(dataValue) }
            ?.id
    }

    val allCodelists: List<CodeList>
        get() = codeListService.codeLists

}