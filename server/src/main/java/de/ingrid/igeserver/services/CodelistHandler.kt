package de.ingrid.igeserver.services

import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.model.CodeList
import org.springframework.stereotype.Service

@Service
class CodelistHandler(private val codeListService: CodeListService) {

    fun getCodelists(ids: List<String>): List<CodeList> {

        return codeListService.codeLists
                .filter { codelist -> ids.contains(codelist.id) }

    }

    fun fetchCodelists(): List<CodeList> {

        return codeListService.updateFromServer()

    }

    val allCodelists: List<CodeList>
        get() = codeListService.codeLists

}