package de.ingrid.igeserver.services

import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.model.HelpMessage
import de.ingrid.igeserver.utils.markdown.MarkdownContextHelpItem
import de.ingrid.igeserver.utils.markdown.MarkdownContextHelpItemKey
import de.ingrid.igeserver.utils.markdown.MarkdownContextHelpUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class ContextHelpService(private val helpUtils: MarkdownContextHelpUtils) {

    val log = logger()
    val defaultLanguage = "de"

    private val markdownContextHelp: Map<MarkdownContextHelpItemKey, MarkdownContextHelpItem> = helpUtils.availableMarkdownHelpFiles

    fun getHelp(profile: String, docType: String, id: String): HelpMessage {

        val help = getContextHelp(profile, docType, id)

        if (help == null) {
            throw ApiException("Context help could not be found")
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
