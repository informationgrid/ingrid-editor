package de.ingrid.igeserver.services

import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.model.HelpMessage
import de.ingrid.igeserver.utils.markdown.MarkdownContextHelpItem
import de.ingrid.igeserver.utils.markdown.MarkdownContextHelpItemKey
import de.ingrid.igeserver.utils.markdown.MarkdownContextHelpUtils
import org.apache.logging.log4j.LogManager
import org.springframework.stereotype.Service

@Service
class ContextHelpService(private val helpUtils: MarkdownContextHelpUtils) {

    companion object {
        private val log = LogManager.getLogger()
    }
    val defaultLanguage = "de"

    private val markdownContextHelp: Map<MarkdownContextHelpItemKey, MarkdownContextHelpItem> = helpUtils.availableMarkdownHelpFiles

    fun getHelp(profile: String, docType: String, id: String): HelpMessage {

        val help = getContextHelp(profile, docType, id) ?: throw NotFoundException.withMissingResource(id, "ContextHelp")
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
        return this.markdownContextHelp.keys
                .filter { it.profile == profile && it.docType == docType }
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
            return markdownContextHelp.get(itemKey)
        }

        log.debug("No markdown help file found for { guid: $id; oid: $docType; language: de}.")
        return null
    }

}
