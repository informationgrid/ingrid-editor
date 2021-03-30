package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.node.ArrayNode
import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.model.CodeList
import de.ingrid.codelists.model.CodeListEntry
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLAccess
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class CodelistHandler(private val codeListService: CodeListService) {

    @Autowired
    lateinit var db: PostgreSQLAccess

    fun getCodelists(ids: List<String>): List<CodeList> {

        return codeListService.codeLists
            .filter { codelist -> ids.contains(codelist.id) }

    }

    fun fetchCodelists(): List<CodeList>? {

        return codeListService.updateFromServer()

    }

    fun getCatalogCodelists(catalogId: String): List<CodeList> {
        // get codelists from catalog
        val result = db.findAll(
            Codelist::class,
            listOf(QueryField("catalog.identifier", catalogId)),
            FindOptions()
        )
        return result.hits.map {
            CodeList().apply {
                id = it.identifier
                name = it.name
                description = it.description
                entries = mutableListOf<CodeListEntry>()
                (it.data as ArrayNode).forEach { entry ->
                    entries.add(CodeListEntry().apply {
                        id = entry.get("id").asText()
                        fields = mapOf(Pair("de", entry.get("localisations").get("de").asText()))
                    })
                }
            }
        }
    }

    val allCodelists: List<CodeList>
        get() = codeListService.codeLists

}