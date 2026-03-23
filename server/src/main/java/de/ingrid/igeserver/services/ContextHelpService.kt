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

import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.model.HelpMessage
import de.ingrid.igeserver.utils.markdown.MarkdownContextHelpItem
import de.ingrid.igeserver.utils.markdown.MarkdownContextHelpItemKey
import de.ingrid.igeserver.utils.markdown.MarkdownContextHelpUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class ContextHelpService(
    private val helpUtils: MarkdownContextHelpUtils,
    private val catalogService: CatalogService,
    private val documentService: DocumentService,
) {

    private val log = logger()

    companion object {
        private const val DEFAULT_LANGUAGE: String = "de"
    }

    private val markdownContextHelp: Map<MarkdownContextHelpItemKey, MarkdownContextHelpItem> =
        helpUtils.availableMarkdownHelpFiles

    fun getHelp(profile: String, docType: String, id: String): HelpMessage {
        val linkedProfiles = catalogService.getCatalogProfile(profile).linkedProfiles
        val parentDocTypes = getParentDocTypes(docType, profile, linkedProfiles)

        val lookupList = mutableListOf<MarkdownContextHelpItem?>()
        lookupList.add(getContextHelp(profile, docType, id))
        parentDocTypes.forEach { lookupList.add(getContextHelp(profile, it, id)) }
        linkedProfiles.forEach { lp ->
            lookupList.add(getContextHelp(lp, docType, id))
            parentDocTypes.forEach { lookupList.add(getContextHelp(lp, it, id)) }
        }
        lookupList.add(getContextHelp("all", "all", id))

        val help: MarkdownContextHelpItem = lookupList.filterNotNull().firstOrNull() ?: run {
            log.debug("No markdown help file found for { profile: $profile, guid: $id; oid: $docType; language: $DEFAULT_LANGUAGE}.")
            throw NotFoundException.withMissingResource(id, "ContextHelp")
        }

        return HelpMessage(
            fieldId = id,
            docType = docType,
            language = DEFAULT_LANGUAGE,
            name = help.title,
            helpText = helpUtils.renderMarkdownFile(help.markDownFilename),
            profile = profile,
        )
    }

    fun getHelpIDs(profile: String, docType: String): List<String> {
        val linkedProfiles = catalogService.getCatalogProfile(profile).linkedProfiles
        val parentDocTypes = getParentDocTypes(docType, profile, linkedProfiles)
        return markdownContextHelp.keys
            .filter {
                matchProfileAndLinkedProfiles(
                    it,
                    profile,
                    linkedProfiles,
                    docType,
                    parentDocTypes,
                ) ||
                    matchCommonIDs(it)
            }
            .map { it.fieldId }
            .distinct()
    }

    private fun matchCommonIDs(key: MarkdownContextHelpItemKey) = key.profile == "all"

    private fun matchProfileAndLinkedProfiles(
        key: MarkdownContextHelpItemKey,
        profile: String,
        linkedProfiles: List<String>,
        docType: String,
        parentDocTypes: List<String>,
    ): Boolean {
        if (key.profile == profile && (key.docType == docType || parentDocTypes.contains(key.docType))) return true
        if (linkedProfiles.contains(key.profile) && (key.docType == docType || parentDocTypes.contains(key.docType))) return true
        return false
    }

    private fun getContextHelp(profile: String?, docType: String?, id: String?): MarkdownContextHelpItem? {
        if (profile == null || docType == null || id == null) return null
        val itemKey = MarkdownContextHelpItemKey(
            fieldId = id,
            profile = profile,
            docType = docType,
            lang = DEFAULT_LANGUAGE,
        )
        return markdownContextHelp[itemKey]
    }

    private fun getParentDocTypes(docType: String, profile: String, linkedProfiles: List<String>): List<String> = try {
        listOfNotNull(documentService.getDocumentType(docType, profile, linkedProfiles).parentClassName())
    } catch (e: Exception) {
        log.debug { "Error getting parent doctype for $docType in profile $profile: ${e.message}" }
        emptyList()
    }
}
