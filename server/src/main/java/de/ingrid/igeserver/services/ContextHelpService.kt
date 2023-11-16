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
        val parentDocType = documentService.getDocumentType(docType).parentClassName()
        val help: MarkdownContextHelpItem = getContextHelp(profile, docType, id)
            ?: parentDocType?.let { getContextHelp(profile, parentDocType, id) }
            ?: catalogService.getCatalogProfile(profile).parentProfile?.let {
                getContextHelp(it, docType, id)
                    ?: parentDocType?.let { parent -> getContextHelp(it, parent, id) }
            }
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
        val parentDocType = documentService.getDocumentType(docType).parentClassName()
        return this.markdownContextHelp.keys
                .filter { (it.profile == profile || it.profile == parentProfile) && (it.docType == docType || it.docType == parentDocType) }
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
