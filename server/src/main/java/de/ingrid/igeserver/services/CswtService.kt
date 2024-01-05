/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.IgeException
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.utils.xml.Csw202NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpStatusCode
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.w3c.dom.Node
import org.xml.sax.InputSource
import java.io.StringReader
import java.io.StringWriter
import java.util.regex.Pattern
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.transform.*
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult

data class CSWTransactionResult(
    var requestId: String? = null,
    var inserts: Int = 0,
    var updates: Int = 0,
    var deletes: Int = 0,
    var insertResults: List<String>? = null,
    var successful: Boolean = false,
    var errorMessage: String? = null,
    var statusCode: HttpStatusCode? = null,
)

@Service
@Profile("csw-t")
class CswtService(
    private val documentService: DocumentService,
    private val importService: ImportService
) {

    val log = logger()

    private val PATTERN_IDENTIFIER = Pattern.compile("^(.*:)?identifier", Pattern.CASE_INSENSITIVE)

    private val utils = XPathUtils(Csw202NamespaceContext())

    private val namespaceCSW: String = "http://www.opengis.net/cat/csw/2.0.2"

    @Transactional
    fun cswTransaction(xml: String?, collectionId: String, principal: Authentication, options: ImportOptions ): CSWTransactionResult {
        val transactionResult = CSWTransactionResult()

        val factory: DocumentBuilderFactory
        val resultInsert: MutableList<String> = mutableListOf()

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
            for (i in 0 until insertDocs.length) {
                val item: Element = insertDocs.item(i) as Element
                // separate importAnalyse and import
                val metadataDoc = item.getElementsByTagNameNS("http://www.isotc211.org/2005/gmd","MD_Metadata").item(0)
                resultInsert.add(utils.getString(metadataDoc, "./gmd:fileIdentifier/gco:CharacterString"))
                val docData = xmlNodeToString(metadataDoc) // convert Node to String
                importDocuments(options, collectionId, "application/xml", docData, principal, recordMustExist = false, null )

            }
            /**
             * UPDATE DOCS
             */
            for (i in 0 until updateDocs.length) {
                val item = updateDocs.item(i) as Element
                val propName: String = utils.getString(item, ".//ogc:PropertyIsEqualTo/ogc:PropertyName")
                val propValue: String = utils.getString(item, ".//ogc:PropertyIsEqualTo/ogc:Literal")
                if (("uuid" == propName || PATTERN_IDENTIFIER.matcher(propName).matches()) && propValue != null) {
                    val metadataDoc = item.getElementsByTagNameNS("http://www.isotc211.org/2005/gmd","MD_Metadata").item(0)
                    val docData = xmlNodeToString(metadataDoc) // convert Node to String
                    importDocuments(options, collectionId, "application/xml", docData, principal, recordMustExist = true, propValue )
                } else {
                    log.error("Constraint not supported with PropertyName: $propName and Literal: $propValue")
                    throw Exception("Constraint not supported with PropertyName: $propName and Literal: $propValue")
                }
            }
            /**
             * DELETE DOCS
             */
            for (i in 0 until deleteDocs.length) {
                val item = deleteDocs.item(i)
                val propName: String = utils.getString(item, ".//ogc:PropertyIsEqualTo/ogc:PropertyName")
                        ?: throw Exception("Missing or empty Constraint \".//ogc:PropertyIsEqualTo/ogc:PropertyName\".")
                var propValue: String = utils.getString(item, ".//ogc:PropertyIsEqualTo/ogc:Literal")
                        ?: throw Exception("Missing or empty Constraint \".//ogc:PropertyIsEqualTo/ogc:Literal\".")
                propValue = propValue.replace("\\s".toRegex(), "")

                // the property "uuid" is still supported for compatibility reasons, see https://dev.informationgrid.eu/redmine/issues/524
                if (("uuid" == propName || PATTERN_IDENTIFIER.matcher(propName).matches()) && propValue != null) {
                    val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, propValue)
                    wrapper.id?.let { documentService.deleteDocument(principal, collectionId, it) }
                }
            }

            transactionResult.apply {
                successful = true
                inserts = insertDocs.length
                updates = updateDocs.length
                deletes = deleteDocs.length
                insertResults = resultInsert
            }

        } catch (e: IgeException) {
            transactionResult.apply {
                successful = false
                statusCode = e.statusCode as HttpStatusCode
                errorMessage = prepareException(e)
            }
            log.error("Error in CSW transaction", e)
        }
        return transactionResult
    }

    private fun importDocuments(options: ImportOptions, collectionId: String, contentType: String, data: String, principal: Authentication, recordMustExist: Boolean, recordId: String?){
            val optimizedImportAnalysis = importService.prepareImportAnalysis(collectionId, contentType, data)
            if(optimizedImportAnalysis.existingDatasets.isNotEmpty()){
                val id = optimizedImportAnalysis.existingDatasets[0].uuid
                if(!recordMustExist) {
                    throw ClientException.withReason("Import Failed: Record with ID '$id' already exists.")
                } else {
                    if(recordId != id) throw ClientException.withReason("Update Failed: Target ID '$recordId' does not match dataset ID '$id'.")
                }
            } else {
                if(recordMustExist) {
                    throw NotFoundException.withMissingResource(recordId!!, "Record")
                }
            }
            importService.importAnalyzedDatasets(
                principal = principal,
                catalogId = collectionId,
                analysis = optimizedImportAnalysis,
                options = options,
                message = Message()
            )
        }

    @Throws(java.lang.Exception::class)
    fun xmlNodeToString(newDoc: Node): String {
        val domSource = DOMSource(newDoc)
        val transformer: Transformer = TransformerFactory.newInstance().newTransformer()
        val sw = StringWriter()
        val sr = StreamResult(sw)
        transformer.transform(domSource, sr)
        return sw.toString()
    }

    fun prepareException(exception: Exception): String {
        var errorMsg = exception.toString()
        var cause = exception.cause
        if (cause == null) {
            cause = exception
        } else {
            errorMsg = cause.toString()
        }
        return errorMsg
    }

    fun prepareXmlResponse(transactionResult: CSWTransactionResult): ByteArray {
        val response = if (transactionResult.successful) {
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
            namespaceCSW,
            "ows:ExceptionReport",
            null
        )

        // create summary
        val exception = doc.createElementNS(
            namespaceCSW,
            "ows:Exception"
        )
        exception.setAttribute("exceptionCode", "NoApplicableCode")
        doc.documentElement.appendChild(exception)
        exception.appendChild(
            doc.createElementNS(
                namespaceCSW,
                "ows:ExceptionText"
            )
        ).appendChild(doc.createTextNode("Cannot process transaction: " + result.errorMessage))
        return doc
    }


    fun createSummaryResponse(result: CSWTransactionResult): Document {
        val docFactory = DocumentBuilderFactory.newInstance()
        docFactory.isNamespaceAware = true
        val docBuilder = docFactory.newDocumentBuilder()
        val domImpl = docBuilder.domImplementation
        val doc = domImpl.createDocument(
            namespaceCSW,
            "csw:TransactionResponse",
            null
        )

        doc.documentElement.setAttribute("xmlns:gmd", "http://www.isotc211.org/2005/gmd")
        doc.documentElement.setAttribute("xmlns:gco", "http://www.isotc211.org/2005/gco")

        // create summary
        val summary = doc.createElementNS(
            namespaceCSW,
            "csw:TransactionSummary"
        )
        summary.setAttribute("requestId", result.requestId)
        doc.documentElement.appendChild(summary)

        val inserts = result.inserts
        summary.appendChild(
            doc.createElement(
                "csw:totalInserted"
            )
        ).appendChild(doc.createTextNode(inserts.toString()))

        val updates = result.updates
        summary.appendChild(
            doc.createElement(
                "csw:totalUpdated"
            )
        ).appendChild(doc.createTextNode(updates.toString()))

        val deletes = result.deletes
        summary.appendChild(
            doc.createElement(
                "csw:totalDeleted"
            )
        ).appendChild(doc.createTextNode(deletes.toString()))


        // add insert results
        result.insertResults?.forEach {
            val uuid: String = it

            val insertResultSummary = doc.createElement(
                "csw:InsertResult"
            )

            insertResultSummary.appendChild(doc.createElement(
                "gmd:fileIdentifier"
            )).appendChild(doc.createElement(
                "gco:CharacterString"
            )).appendChild(doc.createTextNode(uuid))

            doc.documentElement.appendChild(insertResultSummary)
        }


        return doc
    }

}