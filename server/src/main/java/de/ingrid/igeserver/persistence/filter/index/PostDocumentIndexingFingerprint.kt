package de.ingrid.igeserver.persistence.filter.index

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.impl.SimpleContext
import de.ingrid.igeserver.persistence.filter.PostIndexPayload
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.FingerprintInfo
import de.ingrid.igeserver.profiles.ingrid.exporter.convertStringToDocument
import de.ingrid.igeserver.profiles.ingrid.exporter.transformIDFtoIso
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.utils.xml.ConfigurableNamespaceContext
import de.ingrid.utils.xml.IDFNamespaceContext
import de.ingrid.utils.xml.IgcProfileNamespaceContext
import de.ingrid.utils.xml.XMLUtils
import de.ingrid.utils.xpath.XPathUtils
import org.apache.commons.codec.digest.DigestUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import org.w3c.dom.Document
import org.w3c.dom.Node
import java.time.OffsetDateTime

/**
 * Filter for processing steps after removing the document.
 */
@Component
class PostDocumentIndexingFingerprint(val documentWrapperRepository: DocumentWrapperRepository) : Filter<PostIndexPayload> {

    private val log = logger()

    override val profiles = emptyArray<String>()

    private lateinit var xpathUtils: XPathUtils

    val elementsRemovedFromIsoBeforeFingerprint = arrayOf("/gmd:MD_Metadata/gmd:dateStamp", "//@gml:id")

    init {
        val cnc = ConfigurableNamespaceContext()
        cnc.addNamespaceContext(IDFNamespaceContext())
        cnc.addNamespaceContext(IgcProfileNamespaceContext())

        xpathUtils = XPathUtils(cnc)
    }

    override fun invoke(payload: PostIndexPayload, context: Context): PostIndexPayload {
        val exporterType = payload.exportType

        val idf = payload.indexDoc["idf"] as String
        val idfDoc = convertStringToDocument(idf)

        val isoFingerprint = createFingerprint(
                transformIDFtoIso(idfDoc!!).also { prepareIsoForFingerprinting(it) }
        )

        updateFingerprintIfChanged(context, exporterType, isoFingerprint)

        return payload
    }

    private fun updateFingerprintIfChanged(context: Context, exporterType: String, isoFingerprint: String) {
        val catalogIdentifier = context.catalogId
        val uuid = (context as SimpleContext).uuid
        val wrapper = documentWrapperRepository.findByCatalog_IdentifierAndUuid(catalogIdentifier, uuid)

        val fingerprintList = if (wrapper.fingerprint == null) mutableListOf() else wrapper.fingerprint!!

        val previousFingerprint = fingerprintList.find { it.exportType == exporterType }
        if (previousFingerprint?.fingerprint != isoFingerprint) {
            log.debug("Fingerprint changed. Updating metadata-date")
            wrapper.fingerprint = (fingerprintList.filter { it.exportType != exporterType }) + FingerprintInfo(exporterType, isoFingerprint, OffsetDateTime.now())
            documentWrapperRepository.save(wrapper)
        }
    }

    private fun prepareIsoForFingerprinting(doc: Document) {
        elementsRemovedFromIsoBeforeFingerprint.forEach {
            removeNodes(doc, it)
        }
    }

    private fun createFingerprint(doc: Document): String {
        val isoDocAsString = XMLUtils.toString(doc, false)
        return DigestUtils.sha256Hex(isoDocAsString)
    }

    private fun removeNodes(isoDoc: Node, xpath: String) {
        val nodes = xpathUtils.getNodeList(isoDoc, xpath)
        for (i in 0 until nodes.length) {
            XMLUtils.remove(nodes.item(i))
        }
    }

}
