/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.utils.xml.ConfigurableNamespaceContext
import de.ingrid.utils.xml.IDFNamespaceContext
import de.ingrid.utils.xml.IgcProfileNamespaceContext
import de.ingrid.utils.xml.XMLUtils
import de.ingrid.utils.xpath.XPathUtils
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.time.OffsetDateTime

@Service
class IngridIndexExporter(
    @Qualifier("ingridISOExporter") val isoExporter: IngridISOExporter,
    @Qualifier("ingridLuceneExporter") val luceneExporter: IngridLuceneExporter,
) : IgeExporter {

    private val mapper = jacksonObjectMapper()

    private var xpathUtils: XPathUtils

    init {
        val cnc = ConfigurableNamespaceContext()
        cnc.addNamespaceContext(IDFNamespaceContext())
        cnc.addNamespaceContext(IgcProfileNamespaceContext())

        xpathUtils = XPathUtils(cnc)
    }

    override fun exportSql(catalogId: String): String = "${super.exportSql(catalogId)} AND document.data ->> 'hideAddress' IS DISTINCT FROM 'true'"

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "indexInGridIDF",
        "Standard Export Portal (InGrid)",
        "Export von Ingrid Dokumenten ins InGrid-Index Format für die Anzeige im Portal und der Recherche für Schnittstellen.",
        "application/json",
        "json",
        listOf("ingrid"),
        isPublic = true,
        useForPublish = true,
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val luceneDoc = luceneExporter.run(doc, catalogId, options)

        if (doc.type != "FOLDER") {
            val wrapper =
                luceneExporter.documentService.docWrapperRepo.findByCatalog_IdentifierAndUuid(catalogId, doc.uuid)
            val isoDoc = isoExporter.run(doc, catalogId, options)
            val dateStampDate = calculateTimestamp(isoDoc, wrapper)
            val docWithUpdatedTimestamp = updateDateStamp(isoDoc, dateStampDate)
            val idfDoc = convertStringToDocument(docWithUpdatedTimestamp)
            luceneDoc.set(
                "exports",
                jacksonObjectMapper().createObjectNode().apply {
                    put("iso", XMLUtils.toString(transformIDFtoIso(idfDoc!!)))
                },
            )
        }

        val result = luceneDoc.toPrettyString()
        if (!options.skipValidation) validateSchema(result)
        return result
    }

    private fun calculateTimestamp(
        isoDoc: String,
        wrapper: DocumentWrapper,
    ): OffsetDateTime {
        val fingerprint = isoExporter.calculateFingerprint(isoDoc)
        val previousFingerprintInfo = isoExporter.getPreviousFingerprint(wrapper, isoExporter.typeInfo)

        val dateStampDate = if (fingerprint != previousFingerprintInfo?.fingerprint) {
            // updates the fingerprint in the database
            isoExporter.updateDocumentFingerprint(wrapper, fingerprint, isoExporter.typeInfo)
        } else {
            previousFingerprintInfo.date
        }
        return dateStampDate
    }

    /**
     * TODO: this function is a copy of the one in idf exporter. Use simple string replaceby using an unique placeholder!
     */
    @Deprecated("Try to replace by simple string replaceby using an unique placeholder!")
    private fun updateDateStamp(idf: String, publishDate: OffsetDateTime): String {
        val xmlDoc = convertStringToDocument(idf)
        // TODO: use correct date format for IDF depending on the dateStamp element
        //  combine with baw functionality where dateStamp Type can be set by profile.
        val date = publishDate.toLocalDate().toString()
        if (xpathUtils.nodeExists(xmlDoc, "/idf:html/idf:body/idf:idfMdMetadata/gmd:dateStamp/gco:Date")) {
            XMLUtils.createOrReplaceTextNode(
                xpathUtils.getNode(
                    xmlDoc,
                    "/idf:html/idf:body/idf:idfMdMetadata/gmd:dateStamp/gco:Date",
                ),
                date,
            )
        } else if (xpathUtils.nodeExists(xmlDoc, "/idf:html/idf:body/idf:idfMdMetadata/gmd:dateStamp/gco:DateTime")) {
            XMLUtils.createOrReplaceTextNode(
                xpathUtils.getNode(
                    xmlDoc,
                    "/idf:html/idf:body/idf:idfMdMetadata/gmd:dateStamp/gco:DateTime",
                ),
                date,
            )
        }
        return XMLUtils.toString(xmlDoc, false)
    }
}
