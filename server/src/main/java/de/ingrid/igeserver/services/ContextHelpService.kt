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

    private val markdownContextHelp: Map<MarkdownContextHelpItemKey, MarkdownContextHelpItem> = helpUtils.availableMarkdownHelpFiles

    fun getHelp(profile: String, docType: String, id: String): HelpMessage {

        val itemKey = MarkdownContextHelpItemKey(id)

        if (docType != null) {
            itemKey.docType = docType
        }
        /*if (language != null) {
            itemKey.setLang(language)
        } else {
            itemKey.setLang(defaultLanguage)
        }*/

        var markDownFound = false
        if (markdownContextHelp.containsKey(itemKey)) {
            markDownFound = true
        } else {
            itemKey.docType = null
            if (!markdownContextHelp.containsKey(itemKey)) {
                log.debug("No markdown help file found for { guid: $id; oid: $docType; language: de}.")
            } else {
                markDownFound = true
            }
        }
        if (markDownFound) {

            val itemValue: MarkdownContextHelpItem = markdownContextHelp.get(itemKey)!!

            return HelpMessage(
                    fieldId = id,
                    docType = docType,
                    language = itemKey.lang,
                    name = itemValue.title,
                    helpText = helpUtils.renderMarkdownFile(itemValue.markDownFilename),
                    profile = profile
            )

        }

        throw ApiException("Context help could not be found")

    }

}
