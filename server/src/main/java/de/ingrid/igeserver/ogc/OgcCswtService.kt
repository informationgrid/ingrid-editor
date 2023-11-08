package de.ingrid.igeserver.ogc

import de.ingrid.igeserver.IgeException
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.ogc.cswt.CSWTransactionResult
import de.ingrid.igeserver.services.OgcRecordService
import de.ingrid.utils.IngridDocument
import de.ingrid.utils.xml.Csw202NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatusCode
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.xml.sax.InputSource
import java.io.StringReader
import java.io.StringWriter
import java.util.regex.Pattern
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.transform.*
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult


@Service
class OgcCswtService @Autowired constructor(
    private val ogcRecordService: OgcRecordService,
) {

    val log = logger()

    private val PATTERN_IDENTIFIER = Pattern.compile("^(.*:)?identifier", Pattern.CASE_INSENSITIVE)

    private val utils = XPathUtils(Csw202NamespaceContext())

    private val RESPONSE_NAMESPACE: String = "http://www.opengis.net/cat/csw/2.0.2"

    @Transactional
    fun cswTransaction(xml: String?, collectionId: String, principal: Authentication, options: ImportOptions ): IngridDocument {
        val doc = IngridDocument()
        val factory: DocumentBuilderFactory
        var resultInsert: IngridDocument? = null
        var resultUpdate: IngridDocument? = null
        var resultDelete: IngridDocument? = null
        var insertedObjects = 0
        var updatedObjects = 0
        var deletedObjects = 0
        try {
            factory = DocumentBuilderFactory.newInstance()
            factory.isNamespaceAware = true
            val builder = factory.newDocumentBuilder()
            val xmlDoc = builder.parse(InputSource(StringReader(xml)))
            val insertDocs = xmlDoc.getElementsByTagName("csw:Insert")
            val updateDocs = xmlDoc.getElementsByTagName("csw:Update")
            val deleteDocs = xmlDoc.getElementsByTagName("csw:Delete")

            /**
             * INSERT DOCS
             */
            val insertedEntities: MutableList<HashMap<*, *>> = ArrayList()
            for (i in 0 until insertDocs.length) {
                insertedObjects++
                val item: Element = insertDocs.item(i) as Element
                val parentUuid = utils.getString(item, ".//gmd:parentIdentifier/gco:CharacterString")
                // separate importAnalyse and import
                val metadataDoc = item.getElementsByTagNameNS("http://www.isotc211.org/2005/gmd","MD_Metadata").item(0)
                val docData = ogcRecordService.xmlNodeToString(metadataDoc) // convert Node to String
                ogcRecordService.importDocuments(options, collectionId, "application/xml", docData, principal, recordMustExist = false, null )

                val importDoc = IngridDocument()
                importDoc.put( "requestinfo_importObjParentUuid" , parentUuid)
            }
            /**
             * UPDATE DOCS
             */
            val updatedEntities: MutableList<HashMap<*, *>> = ArrayList()
            for (i in 0 until updateDocs.length) {
                updatedObjects++
                val item = updateDocs.item(i) as Element
                val parentUuid = utils.getString(item, ".//gmd:parentIdentifier/gco:CharacterString")
                val propName: String = utils.getString(item, ".//ogc:PropertyIsEqualTo/ogc:PropertyName")
                val propValue: String = utils.getString(item, ".//ogc:PropertyIsEqualTo/ogc:Literal")
                if (("uuid" == propName || PATTERN_IDENTIFIER.matcher(propName).matches()) && propValue != null) {
                    val metadataDoc = item.getElementsByTagNameNS("http://www.isotc211.org/2005/gmd","MD_Metadata").item(0)
                    val docData = ogcRecordService.xmlNodeToString(metadataDoc) // convert Node to String
                    ogcRecordService.importDocuments(options, collectionId, "application/xml", docData, principal, recordMustExist = true, propValue )
                } else {
                    log.error("Constraint not supported with PropertyName: $propName and Literal: $propValue")
                    throw Exception("Constraint not supported with PropertyName: $propName and Literal: $propValue")
                }
            }
            /**
             * DELETE DOCS
             */
            val deletedEntities: MutableList<HashMap<*, *>> = ArrayList()
            for (i in 0 until deleteDocs.length) {
                deletedObjects++
                val item = deleteDocs.item(i)
                val propName: String = utils.getString(item, ".//ogc:PropertyIsEqualTo/ogc:PropertyName")
                        ?: throw Exception("Missing or empty Constraint \".//ogc:PropertyIsEqualTo/ogc:PropertyName\".")
                var propValue: String = utils.getString(item, ".//ogc:PropertyIsEqualTo/ogc:Literal")
                        ?: throw Exception("Missing or empty Constraint \".//ogc:PropertyIsEqualTo/ogc:Literal\".")
                propValue = propValue.replace("\\s".toRegex(), "")

                // the property "uuid" is still supported for compatibility reasons, see https://dev.informationgrid.eu/redmine/issues/524
                if (("uuid" == propName || PATTERN_IDENTIFIER.matcher(propName).matches()) && propValue != null) {
                    ogcRecordService.deleteRecord(principal, collectionId, propValue)
                }
            }


            val result = IngridDocument()
            result.putInt("inserts", insertedObjects)
            result.putInt("updates", updatedObjects)
            result.putInt("deletes", deletedObjects)
            result["resultInserts"] = resultInsert
            result["resultUpdates"] = resultUpdate
            doc.putBoolean("success", true)
            doc["result"] = result

        } catch (e: IgeException) {
            doc["statusCode"] = e.statusCode as HttpStatusCode
            doc["error"] = prepareException(e)
            log.error("Error in CSW transaction", e)
            doc.putBoolean("success", false)
        }
        return doc
    }


    fun prepareException(exception: java.lang.Exception): String {
        var errorMsg = exception.toString()
        var cause = exception.cause
        if (cause == null) {
            cause = exception
        } else {
            errorMsg = cause.toString()
        }
        return errorMsg
    }


    fun processCswTransaction(response: IngridDocument): CSWTransactionResult {
        val result = CSWTransactionResult()

        if (response.getBoolean("success")) {
            val responseResult = response["result"] as IngridDocument

            // construct result
            if (responseResult != null) {
                result.setNumberOfInserts(responseResult.getInt("inserts"))
                result.setNumberOfUpdates(responseResult.getInt("updates"))
                result.setNumberOfDeletes(responseResult.getInt("deletes"))
            }
        }

        result.setSuccessful(response.getBoolean("success"))
        result.setErrorMessage(response.getString("error"))

        return result
    }

    fun prepareXmlResponse(transactionResult: CSWTransactionResult): ByteArray {
        val response = if (transactionResult.isSuccessful()) {
            createSummaryResponse(transactionResult)
        } else {
            createErrorResponse(transactionResult)
        }

        val tf = TransformerFactory.newInstance()
        val transformer = tf.newTransformer();
        val writer = StringWriter()

        transformer.transform(DOMSource(response), StreamResult(writer))

        return writer.buffer.toString().toByteArray()
    }


    fun createErrorResponse(result: CSWTransactionResult): Document {
        val docFactory = DocumentBuilderFactory.newInstance()
        docFactory.isNamespaceAware = true
        val docBuilder = docFactory.newDocumentBuilder()
        val domImpl = docBuilder.domImplementation
        val doc = domImpl.createDocument(
            RESPONSE_NAMESPACE,
            "ows:ExceptionReport",
            null
        )

        // create summary
        val exception = doc.createElementNS(
            RESPONSE_NAMESPACE,
            "ows:Exception"
        )
        exception.setAttribute("exceptionCode", "NoApplicableCode")
        doc.documentElement.appendChild(exception)
        exception.appendChild(
            doc.createElementNS(
                RESPONSE_NAMESPACE,
                "ows:ExceptionText"
            )
        )
            .appendChild(doc.createTextNode("Cannot process transaction: " + result.getErrorMessage()))
        return doc
    }


    fun createSummaryResponse(result: CSWTransactionResult): Document {
        val docFactory = DocumentBuilderFactory.newInstance()
        docFactory.isNamespaceAware = true
        val docBuilder = docFactory.newDocumentBuilder()
        val domImpl = docBuilder.domImplementation
        val doc = domImpl.createDocument(
            RESPONSE_NAMESPACE,
            "csw:TransactionResponse",
            null
        )

        // create summary
        val summary = doc.createElementNS(
            RESPONSE_NAMESPACE,
            "csw:TransactionSummary"
        )
        summary.setAttribute("requestId", result.getRequestId())
        doc.documentElement.appendChild(summary)

        val inserts = result.getNumberOfInserts()
        summary.appendChild(
            doc.createElementNS(
                RESPONSE_NAMESPACE,
                "totalInserted"
            )
        ).appendChild(doc.createTextNode(inserts.toString()))

        val updates = result.getNumberOfUpdates()
        summary.appendChild(
            doc.createElementNS(
                RESPONSE_NAMESPACE,
                "totalUpdated"
            )
        ).appendChild(doc.createTextNode(updates.toString()))

        val deletes = result.getNumberOfDeletes()
        summary.appendChild(
            doc.createElementNS(
                RESPONSE_NAMESPACE,
                "totalDeleted"
            )
        ).appendChild(doc.createTextNode(deletes.toString()))

        return doc
    }

}