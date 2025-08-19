/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
        val parentProfile = catalogService.getCatalogProfile(profile).parentProfile
        val parentDocType = getParentDoctype(docType, profile, parentProfile)
        val help: MarkdownContextHelpItem = listOfNotNull(
            getContextHelp(profile, docType, id),
            getContextHelp(profile, parentDocType, id),
            getContextHelp(parentProfile, docType, id),
            getContextHelp(parentProfile, parentDocType, id),
            getContextHelp("all", "all", id),
        ).firstOrNull() ?: run {
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
        val parentProfile = catalogService.getCatalogProfile(profile).parentProfile
        val parentDocType = getParentDoctype(docType, profile, parentProfile)
        return markdownContextHelp.keys
            .filter {
                matchProfileAndParentProfile(
                    it,
                    profile,
                    parentProfile,
                    docType,
                    parentDocType,
                ) ||
                    matchCommonIDs(it)
            }
            .map { it.fieldId }
            .distinct()
    }

    private fun matchCommonIDs(key: MarkdownContextHelpItemKey) = key.profile == "all"

    private fun matchProfileAndParentProfile(
        key: MarkdownContextHelpItemKey,
        profile: String,
        parentProfile: String?,
        docType: String,
        parentDocType: String?,
    ): Boolean = (key.profile == profile && key.docType == docType) ||
        (key.profile == profile && key.docType == parentDocType) ||
        (key.profile == parentProfile && key.docType == docType) ||
        (key.profile == parentProfile && key.docType == parentDocType)

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

    private fun getParentDoctype(docType: String, profile: String, parentProfile: String?): String? = try {
        documentService.getDocumentType(docType, profile, parentProfile).parentClassName()
    } catch (e: Exception) {
        log.debug { "Error getting parent doctype for $docType in profile $profile: ${e.message}" }
        null
    }
}
