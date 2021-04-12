package de.ingrid.igeserver.services

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
                    entries = it.data?.map { entry -> CodeListEntry().apply {
                        id = entry.get("id").asText()
                        data = if (entry.get("data") == null || entry.get("data").isNull) null else entry.get("data").asText()
                        fields = mapOf(Pair("de", entry.get("localisations").get("de").asText()))
                    } } ?: mutableListOf()
                }
            }
    }

    fun updateCodelist(catalogId: String, id: String, codelist: Codelist): Codelist? {
        val dbCodelist = codelistRepo.findByCatalog_IdentifierAndIdentifier(catalogId, id)
        codelist.id = dbCodelist.id
        codelist.catalog = catalogRepo.findByIdentifier(catalogId)
        return codelistRepo.save(codelist)
    }

    val allCodelists: List<CodeList>
        get() = codeListService.codeLists

}