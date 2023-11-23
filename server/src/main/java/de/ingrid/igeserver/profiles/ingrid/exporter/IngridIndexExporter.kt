package de.ingrid.igeserver.profiles.ingrid.exporter

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.FingerprintInfo
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.utils.ElasticDocument
import de.ingrid.utils.xml.ConfigurableNamespaceContext
import de.ingrid.utils.xml.IDFNamespaceContext
import de.ingrid.utils.xml.IgcProfileNamespaceContext
import de.ingrid.utils.xml.XMLUtils
import de.ingrid.utils.xpath.XPathUtils
import org.apache.commons.codec.digest.DigestUtils
import org.springframework.stereotype.Service
import org.w3c.dom.Node
import java.time.OffsetDateTime

@Service
class IngridIndexExporter(
    val idfExporter: IngridIDFExporter,
    val luceneExporter: IngridLuceneExporter,
    val documentWrapperRepository: DocumentWrapperRepository
) : IgeExporter {

    private val typeId = "indexInGridIDF"

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        typeId,
        "Ingrid IDF (Elasticsearch)",
        "Export von Ingrid Dokumenten ins IDF Format für die Anzeige im Portal ins Elasticsearch-Format.",
        "application/json",
        "json",
        listOf("ingrid"),
        false
    )

    private lateinit var xpathUtils: XPathUtils

    val elementsRemovedFromIsoBeforeFingerprint = arrayOf("/gmd:MD_Metadata/gmd:dateStamp", "//@gml:id")

    init {
        val cnc = ConfigurableNamespaceContext()
        cnc.addNamespaceContext(IDFNamespaceContext())
        cnc.addNamespaceContext(IgcProfileNamespaceContext())

        xpathUtils = XPathUtils(cnc)
    }

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val idf = idfExporter.run(doc, catalogId)
        val luceneDoc = luceneExporter.run(doc, catalogId) as String

        val mapper = jacksonObjectMapper()
        val luceneJson = mapper.readValue(luceneDoc, ObjectNode::class.java)

        if (doc.type != "FOLDER") {
            val idfFingerprintChecked = handleFingerprint(catalogId, doc.uuid, idf)
            luceneJson.put("idf", idfFingerprintChecked)
        }

        return luceneJson.toPrettyString()
    }

    private fun handleFingerprint(catalogId: String, uuid: String, idf: String): String {
        val fingerprint = calculateFingerprint(ElasticDocument().apply { put("idf", idf) })

        val previousFingerprintInfo = getPreviousFingerprint(catalogId, uuid)

        if (fingerprint == previousFingerprintInfo?.fingerprint) {
            log.debug("Fingerprint did not change. Using last publish date")
            val idfDoc = convertStringToDocument(idf)
            addPublishDateToIndexDocument(idfDoc!!, previousFingerprintInfo.date)
            return XMLUtils.toString(idfDoc)
        }
        return idf
    }

    private fun addPublishDateToIndexDocument(idf: org.w3c.dom.Document, publishDate: OffsetDateTime) {
        val date = publishDate.toLocalDate().toString()
        if (xpathUtils.nodeExists(idf, "/idf:html/idf:body/idf:idfMdMetadata/gmd:dateStamp/gco:Date")) {
            XMLUtils.createOrReplaceTextNode(
                xpathUtils.getNode(
                    idf,
                    "/idf:html/idf:body/idf:idfMdMetadata/gmd:dateStamp/gco:Date"
                ), date
            )
        } else if (xpathUtils.nodeExists(idf, "/idf:html/idf:body/idf:idfMdMetadata/gmd:dateStamp/gco:DateTime")) {
            XMLUtils.createOrReplaceTextNode(
                xpathUtils.getNode(
                    idf,
                    "/idf:html/idf:body/idf:idfMdMetadata/gmd:dateStamp/gco:DateTime"
                ), date
            )
        }

    }

    private fun getPreviousFingerprint(catalogId: String, uuid: String): FingerprintInfo? {
        val wrapper = documentWrapperRepository.findByCatalog_IdentifierAndUuid(catalogId, uuid)
        return wrapper.fingerprint?.find { it.exportType == typeId }
    }


    override fun calculateFingerprint(doc: Any): String {
        doc as ElasticDocument
        if (doc["idf"] == null) return ""

        val idf = doc["idf"] as String
        val idfDoc = convertStringToDocument(idf)

        return createFingerprint(
            transformIDFtoIso(idfDoc!!).also { prepareIsoForFingerprinting(it) }
        )
    }

    private fun createFingerprint(doc: org.w3c.dom.Document): String {
        val isoDocAsString = XMLUtils.toString(doc, false)
        return DigestUtils.sha256Hex(isoDocAsString)
    }

    private fun prepareIsoForFingerprinting(doc: org.w3c.dom.Document) {
        elementsRemovedFromIsoBeforeFingerprint.forEach {
            removeNodes(doc, it)
        }
    }

    private fun removeNodes(isoDoc: Node, xpath: String) {
        val nodes = xpathUtils.getNodeList(isoDoc, xpath)
        for (i in 0 until nodes.length) {
            XMLUtils.remove(nodes.item(i))
        }
    }
}
