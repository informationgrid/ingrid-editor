/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.model.CodeList
import de.ingrid.codelists.model.CodeListEntry
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.CodelistRepository
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CodelistHandler(
    private val codelistRepo: CodelistRepository,
    private val catalogRepo: CatalogRepository,
    private val codeListService: CodeListService,
) {
    private val log = logger()

    companion object {
        fun toCodelistEntry(
            id: String,
            german: String,
            data: String? = null,
            english: String? = null,
            description: String? = null,
            iso: String? = null,
        ): JsonNode = jacksonObjectMapper().createObjectNode().apply {
            put("id", id)
            if (data != null) put("data", data)
            set<JsonNode>(
                "localisations",
                jacksonObjectMapper().createObjectNode().apply {
                    put("de", german)
                    if (english != null) put("en", english)
                    if (iso != null) put("iso", iso)
                },
            )
            if (description != null) put("description", description)
        }
    }

    fun removeCodelist(catalogId: String, codelistIdentifier: String) {
        codelistRepo.deleteByCatalog_IdentifierAndIdentifier(catalogId, codelistIdentifier)
    }

    fun removeAndAddCodelist(catalogId: String, codelist: Codelist) {
        removeCodelist(catalogId, codelist.identifier)
        codelistRepo.flush()
        codelistRepo.save(codelist)
    }

    fun removeAndAddCodelists(catalogId: String, codelists: List<Codelist>) {
        codelists.forEach {
            removeCodelist(catalogId, it.identifier)
        }
        codelistRepo.flush()
        codelistRepo.saveAll(codelists)
    }

    fun getCodelists(ids: List<String>): List<CodeList> = codeListService.codeLists
        .filter { codelist -> ids.contains(codelist.id) }

    fun fetchCodelists(): List<CodeList>? = codeListService.updateFromServer()

    fun getCatalogCodelists(catalogId: String): List<CodeList> = codelistRepo
        .findAllByCatalog_Identifier(catalogId)
        .map {
            CodeList().apply {
                id = it.identifier
                name = it.name
                description = it.description
                defaultEntry = it.defaultEntry
                entries = it.data?.map { entry ->
                    CodeListEntry().apply {
                        id = entry.get("id")?.asText()
                            ?: throw ServerException.withReason("Error getting codelist entries from '${it.name}' (${it.identifier})")
                        description =
                            if (entry.get("description") == null || entry.get("description").isNull) {
                                null
                            } else {
                                entry.get(
                                    "description",
                                ).asText()
                            }
                        data =
                            if (entry.get("data") == null || entry.get("data").isNull) {
                                null
                            } else {
                                entry.get("data")
                                    .asText()
                            }
                        fields = ObjectMapper().convertValue(
                            entry.get("localisations"),
                            jacksonTypeRef<Map<String, String>>(),
                        )
                    }
                } ?: mutableListOf()
            }
        }

    fun getCatalogCodelistValue(catalogId: String, codelistId: String, key: String, language: String = "de"): String? = getCatalogCodelists(catalogId)
        .find { it.id == codelistId }
        ?.entries
        ?.find { it.id == key }
        ?.fields?.get(language)

    fun getCatalogCodelistKey(catalogId: String, codelistId: String, value: String?, language: String = "de"): String? = getCatalogCodelists(catalogId)
        .find { it.id == codelistId }
        ?.entries
        ?.find { value != null && it.getField(language) == value }
        ?.id

    fun getCodelistEntry(codelistId: String, key: String): CodeListEntry? = getCodelists(listOf(codelistId))
        .find { it.id == codelistId }
        ?.entries
        ?.find { it.id == key }

    fun getCodelistEntryDataField(codelistId: String, key: String): String? = getCodelists(listOf(codelistId))
        .find { it.id == codelistId }
        ?.entries
        ?.find { it.id == key }
        ?.data

    fun getCodelistValue(codelistId: String, key: String, field: String = "de"): String? = getCodelists(listOf(codelistId))
        .find { it.id == codelistId }
        ?.entries
        ?.find { it.id == key }
        ?.fields?.get(field)

    fun updateCodelist(catalogId: String, id: String, codelist: Codelist): Codelist? {
        val dbCodelist = codelistRepo.findByCatalog_IdentifierAndIdentifier(catalogId, id)
        codelist.id = dbCodelist.id
        codelist.catalog = catalogRepo.findByIdentifier(catalogId)
        return codelistRepo.save(codelist)
    }

    fun getCodeListEntryId(listId: String, value: String?, language: String?): String? = if (value == null) {
        null
    } else {
        val id = codeListService.getCodeListEntryId(listId, value, language)
        // try German localization if id not found and language is not German
        id ?: if (language != "de") codeListService.getCodeListEntryId(listId, value, "de") else null
    }

    fun getCodeListEntryIdMatchingData(listId: String, dataValue: String): String? = codeListService.getCodeList(listId)
        .entries.find { it.data.contains(dataValue) }
        ?.id

    fun getDefaultCodelistEntryId(listId: String): String? {
        val defaultEntryId = codeListService.getCodeList(listId).defaultEntry
        return if (defaultEntryId == "-1") null else defaultEntryId
    }

    fun getDefaultCatalogCodelistEntry(catalogId: String, listId: String): CodeListEntry? {
        val codelist = getCatalogCodelists(catalogId).find { it.id == listId }
        return codelist?.defaultEntry?.let { defaultKey -> codelist.entries?.find { it.id == defaultKey } }
    }

    val allCodelists: List<CodeList> = codeListService.codeLists

    val initialCodelists: MutableList<CodeList> = codeListService.initialCodelists

    @Transactional
    fun addEntryToCatalogCodelist(catalogId: String, codelistId: String, value: String): String {
        val dbCodelist = codelistRepo.findAllByCatalog_Identifier(catalogId).find { it.identifier == codelistId }
            ?: throw ServerException.withReason("Codelist $codelistId not found")

        val entries = dbCodelist.data as? ArrayNode ?: jacksonObjectMapper().createArrayNode()

        // Check if value already exists
        val existingEntry = entries.find {
            it.get("localisations")?.get("de")?.asText() == value
        }

        if (existingEntry != null) {
            log.warn("Duplicate entry detected for value '$value' in codelist $codelistId. Skipping addition.")
            return existingEntry.get("id").asText()
        }

        val existingIds = entries.mapNotNull { it.get("id")?.asText() }
        val newId = generateNewId(existingIds)
        entries.add(toCodelistEntry(newId, value))
        dbCodelist.data = entries
        codelistRepo.save(dbCodelist)
        return newId
    }

    private fun generateNewId(existingIds: List<String>): String {
        val numericIds = existingIds.mapNotNull { it.toIntOrNull() }
        var nextId = if (numericIds.isEmpty()) 1 else numericIds.max() + 1
        while (existingIds.contains(nextId.toString())) {
            nextId++
        }
        return nextId.toString()
    }
}
