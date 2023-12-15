/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
class ContextHelpService(private val helpUtils: MarkdownContextHelpUtils, val catalogService: CatalogService, val documentService: DocumentService) {

    val log = logger()
    val defaultLanguage = "de"

    private val markdownContextHelp: Map<MarkdownContextHelpItemKey, MarkdownContextHelpItem> = helpUtils.availableMarkdownHelpFiles

    fun getHelp(profile: String, docType: String, id: String): HelpMessage {
        val help: MarkdownContextHelpItem = getContextHelp(profile, docType, id)
            ?: catalogService.getCatalogProfile(profile).parentProfile?.let { getContextHelp(it, docType, id) }
            ?: getContextHelp("all", "all", id)
            ?: run {
                log.debug("No markdown help file found for { profile: $profile, guid: $id; oid: $docType; language: de}.")
                throw NotFoundException.withMissingResource(id, "ContextHelp")
            }

        return HelpMessage(
            fieldId = id,
            docType = docType,
            language = defaultLanguage,
            name = help.title,
            helpText = helpUtils.renderMarkdownFile(help.markDownFilename),
            profile = profile
        )
    }

    fun getHelpIDs(profile: String, docType: String): List<String> {
        val parentProfile = catalogService.getCatalogProfile(profile).parentProfile
        return this.markdownContextHelp.keys
                .filter { (it.profile == profile || it.profile == parentProfile) && it.docType == docType }
                .map { it.fieldId }
                .distinct()
    }

    private fun getContextHelp(profile: String, docType: String, id: String): MarkdownContextHelpItem? {
        val itemKey = MarkdownContextHelpItemKey(
                fieldId = id,
                profile = profile,
                docType = docType,
                lang = defaultLanguage
        )

        if (markdownContextHelp.containsKey(itemKey)) {
            return markdownContextHelp[itemKey]
        }

        return null
    }

}
