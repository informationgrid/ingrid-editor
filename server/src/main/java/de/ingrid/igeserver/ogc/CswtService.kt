package de.ingrid.igeserver.ogc

import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.services.OgcRecordService
import de.ingrid.utils.IngridDocument
import de.ingrid.utils.xml.Csw202NamespaceContext
import de.ingrid.utils.xml.XMLUtils
import de.ingrid.utils.xpath.XPathUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.w3c.dom.Element
import org.w3c.dom.Node
import org.xml.sax.InputSource
import java.io.StringReader
import java.util.regex.Pattern
import javax.xml.parsers.DocumentBuilder
import javax.xml.parsers.DocumentBuilderFactory

@Service
class CswtService @Autowired constructor(
//        private val catalogJob: importAnalyzeTask,
    private val ogcRecordService: OgcRecordService,
    private val importService: ImportService,
) {

    val log = logger()

    private val PATTERN_IDENTIFIER = Pattern.compile("^(.*:)?identifier", Pattern.CASE_INSENSITIVE)


    private fun parseXmlDocument(data: String): Any {
        val xmlInput = InputSource(StringReader(data))
        val dbf = DocumentBuilderFactory.newInstance()
        dbf.isNamespaceAware = true
        val doc = dbf.newDocumentBuilder().parse(xmlInput)

        return doc
    }

//    val utils = de.ingrid.utils.xpath.XPathUtils

    private val utils = XPathUtils(Csw202NamespaceContext())

    @Transactional
    fun cswTransaction(xml: String?, collectionId: String, principal: Authentication, options: ImportOptions ): IngridDocument? {
        val doc = IngridDocument()
        val factory: DocumentBuilderFactory
        var resultInsert: IngridDocument? = null
        var resultUpdate: IngridDocument? = null
        var resultDelete: IngridDocument? = null
        var insertedObjects = 0
        var updatedObjects = 0
        var deletedObjects = 0
//        try {
            factory = DocumentBuilderFactory.newInstance()
            factory.isNamespaceAware = true
            val builder = factory.newDocumentBuilder()
            val xmlDoc = builder.parse(InputSource(StringReader(xml)))
            val insertDocs = xmlDoc.getElementsByTagName("csw:Insert")
            val updateDocs = xmlDoc.getElementsByTagName("csw:Update")
            val deleteDocs = xmlDoc.getElementsByTagName("csw:Delete")
//            adminUserUUID = catalogJob.getCatalogAdminUserUuid()
//            catalogJob.beginTransaction()
            /**
             * INSERT DOCS
             */
            // remember inserted entities for updating ES index and audit log (AFTER commit !)
            val insertedEntities: MutableList<HashMap<*, *>> = ArrayList()
            for (i in 0 until insertDocs.length) {
                val item: Element = insertDocs.item(i) as Element
                val metadataDoc = item.getElementsByTagNameNS("http://www.isotc211.org/2005/gmd","MD_Metadata").item(0)
                val docData = ogcRecordService.xmlNodeToString(metadataDoc) // convert Node to String
                ogcRecordService.importDocuments(options, collectionId, "application/xml", docData, principal, recordMustExist = false, null )
            }
            /**
             * UPDATE DOCS
             */
            // remember updated entities for updating ES index and audit log (AFTER commit !)
            val updatedEntities: MutableList<HashMap<*, *>> = ArrayList()
            for (i in 0 until updateDocs.length) {
                val item = updateDocs.item(i) as Element
//                val parentUuid: String = utils.getString(item, ".//gmd:parentIdentifier/gco:CharacterString")
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
            // remember updated entities for updating ES index and audit log (AFTER commit !)
            val deletedEntities: MutableList<HashMap<*, *>> = ArrayList()
            for (i in 0 until deleteDocs.length) {
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
//            catalogJob.commitTransaction()
//
//            // Update search index with data of all published entities and also log audit if set
//            // Has to be executed after commit so data in database is up to date !
//            catalogJob.updateSearchIndexAndAudit(insertedEntities)
//            catalogJob.updateSearchIndexAndAudit(updatedEntities)
//            // also remove from index when deleted
//            catalogJob.updateSearchIndexAndAudit(deletedEntities)
//            val result = IngridDocument()
//            result.putInt("inserts", insertedObjects)
//            result.putInt("updates", updatedObjects)
//            result.putInt("deletes", deletedObjects)
//            result["resultInserts"] = resultInsert
//            result["resultUpdates"] = resultUpdate
//            doc.putBoolean("success", true)
//            doc["result"] = result

//        } catch (e: Exception) {
////            doc["error"] = prepareException(e)
//            log.error("Error in CSW transaction", e)
//            doc.putBoolean("success", false)
//        }
        return doc
    }


    @Throws(java.lang.Exception::class)
    private fun prepareImportAnalyzeDocument(builder: DocumentBuilder, doc: Node): IngridDocument {
        // find first child of doc that is an Element i.e. has type Node.ELEMENT_NODE
        var nodeToImport: Node? = null
        val importCandidates = doc.childNodes
        var i = 0
        while (i < importCandidates.length && nodeToImport == null) {
            val candidate = importCandidates.item(i)
            if (candidate.nodeType == Node.ELEMENT_NODE) {
                nodeToImport = candidate
            }
            i++
        }
        requireNotNull(nodeToImport) { "No valid node for import found." }
        val singleInsertDocument = builder.newDocument()
        val importedNode = singleInsertDocument.importNode(nodeToImport, true)
        singleInsertDocument.appendChild(importedNode)
        val insertDoc = XMLUtils.toString(singleInsertDocument)
        val docIn = IngridDocument()
//        docIn[MdekKeys.USER_ID] = adminUserUUID
//        docIn[MdekKeys.REQUESTINFO_IMPORT_DATA] = MdekIdcCatalogJob.compress(ByteArrayInputStream(insertDoc.toByteArray())).toByteArray()
//        docIn[MdekKeys.REQUESTINFO_IMPORT_FRONTEND_PROTOCOL] = "csw202"
//        docIn.putBoolean(MdekKeys.REQUESTINFO_IMPORT_START_NEW_ANALYSIS, true)
//        docIn.putBoolean(MdekKeys.REQUESTINFO_TRANSACTION_IS_HANDLED, true)
//        docIn.putBoolean(MdekKeys.REQUESTINFO_IMPORT_PUBLISH_IMMEDIATELY, true)
//        docIn.putBoolean(MdekKeys.REQUESTINFO_IMPORT_DO_SEPARATE_IMPORT, false)
//        docIn.putBoolean(MdekKeys.REQUESTINFO_IMPORT_COPY_NODE_IF_PRESENT, false)
//        docIn.putBoolean(MdekKeys.REQUESTINFO_IMPORT_ERROR_ON_EXISTING_UUID, false)
//        docIn.putBoolean(MdekKeys.REQUESTINFO_IMPORT_ERROR_ON_EXCEPTION, true)
//        docIn.putBoolean(MdekKeys.REQUESTINFO_IMPORT_IGNORE_PARENT_IMPORT_NODE, true)
        return docIn
    }
}