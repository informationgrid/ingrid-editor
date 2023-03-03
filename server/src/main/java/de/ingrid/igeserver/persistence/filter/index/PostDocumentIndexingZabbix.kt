package de.ingrid.igeserver.persistence.filter.index

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostIndexPayload
import de.ingrid.igeserver.zabbix.ZabbixModel
import de.ingrid.igeserver.zabbix.ZabbixService
import de.ingrid.utils.xpath.XPathUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import org.xml.sax.InputSource
import java.io.StringReader
import javax.xml.parsers.DocumentBuilderFactory

/**
 * Filter for processing steps after removing the document.
 */
@Component
@Profile("zabbix")
class PostDocumentIndexing @Autowired constructor(val zabbixService: ZabbixService) : Filter<PostIndexPayload> {

    private val log = logger()

    override val profiles = arrayOf("uvp")

    override fun invoke(payload: PostIndexPayload, context: Context): PostIndexPayload {

        payload.indexDoc
        val catalogIdentifier = context.catalogId

        if (zabbixService.activatedCatalogs.contains(catalogIdentifier)) {
            val idf = payload.indexDoc["idf"].toString()
            val documentBuilderFactory = DocumentBuilderFactory.newInstance()
            val documentBuilder = documentBuilderFactory.newDocumentBuilder()
            val xml = InputSource(StringReader(idf))
            val xmlDocument = documentBuilder.parse(xml)
            val xpath = XPathUtils()
            val uploadUrl = zabbixService.uploadUrl
            val uuid = xpath.getString(xmlDocument, "//idfMdMetadata/id")
            val documentTitle = xpath.getString(xmlDocument, "//idfMdMetadata/name")
            val detailUrl = zabbixService.detailUrl?.format(uuid)
            val uploads = if (xpath.getString(xmlDocument, "//steps").isNotBlank()) {
                // Get uvp docs
                xpath.getNodeList(xmlDocument, "//steps/step/docs/doc")
            } else {
                // Get uvpNegativeRelevantDocs
                xpath.getNodeList(xmlDocument, "//docs/doc")
            }
            val uploadsToAdd = mutableListOf<ZabbixModel.Upload>()
            for (j in 0 until uploads.length) {
                val label = xpath.getString(uploads.item(j), "./label")
                val link = xpath.getString(uploads.item(j), "./link")

                // handle uploaded and hyperlinked documents
                val absoluteLink =
                    if (link.startsWith("/documents")) uploadUrl + link.removePrefix("/documents") else link

                val upload = ZabbixModel.Upload(label, absoluteLink)
                uploadsToAdd.add(upload)
            }

            val data = ZabbixModel.ZabbixData(catalogIdentifier, uuid, documentTitle, detailUrl!!, uploadsToAdd)
            zabbixService.addOrUpdateVerfahren(data)
        }

        return payload
    }

}
