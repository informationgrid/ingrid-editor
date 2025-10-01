/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.exports

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.FingerprintInfo
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.utils.SpringContext
import org.apache.commons.codec.digest.DigestUtils
import java.io.StringReader
import java.io.StringWriter
import java.time.OffsetDateTime
import javax.xml.XMLConstants
import javax.xml.transform.OutputKeys
import javax.xml.transform.Source
import javax.xml.transform.Transformer
import javax.xml.transform.TransformerFactory
import javax.xml.transform.stream.StreamResult
import javax.xml.transform.stream.StreamSource

data class ExportOptions(val includeDraft: Boolean, val catalogProfile: String? = null, var tags: List<String> = emptyList())

interface IgeExporter {
    val typeInfo: ExportTypeInfo

    /*
     * Default export SQL to request published datasets including folders in draft state (since they might be archived!?)
     */
    fun exportSql(catalogId: String): String = """
        (document.state = 'PUBLISHED' OR (document.type = 'FOLDER' AND document.state = 'DRAFT'))
    """.trimIndent()

    fun run(doc: Document, catalogId: String, options: ExportOptions = ExportOptions(false)): Any
    fun toString(exportedObject: Any): String = exportedObject.toString()

    fun prettyFormat(input: String, indent: Int): String = try {
        val xmlInput: Source = StreamSource(StringReader(input))
        val stringWriter = StringWriter()
        val xmlOutput = StreamResult(stringWriter)
        val transformerFactory = TransformerFactory.newInstance()
        transformerFactory.setAttribute("indent-number", indent)
        transformerFactory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "")
        transformerFactory.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "")
        val transformer: Transformer =
            transformerFactory.newTransformer(StreamSource(javaClass.getResourceAsStream("/prettyprint.xsl")))
        transformer.setOutputProperty(OutputKeys.INDENT, "yes")
        transformer.transform(xmlInput, xmlOutput)
        xmlOutput.writer.toString()
    } catch (e: Exception) {
        throw RuntimeException(e) // simple exception handling, please review it
    }

    fun calculateFingerprint(doc: Any): String = DigestUtils.sha256Hex(doc.toString())

    /**
     * Updates the document's fingerprint in the database with the current date and time.
     * If the fingerprint for the implementing exporter already exists, it will be replaced.
     * @param wrapper The document wrapper to update.
     * @param fingerprint The new fingerprint to set.
     * @return The current date and time when the fingerprint was updated.
     */
    fun updateDocumentFingerprint(
        wrapper: DocumentWrapper,
        fingerprint: String,
        typeInfo: ExportTypeInfo,
    ): OffsetDateTime {
        val currentDate = OffsetDateTime.now()
        wrapper.fingerprint = (wrapper.fingerprint ?: mutableListOf()).filter { it.exportType != typeInfo.type } +
            FingerprintInfo(
                typeInfo.type,
                fingerprint,
                currentDate,
            )
        SpringContext.getBean(DocumentWrapperRepository::class.java)!!.save(wrapper)
        return currentDate
    }

    fun getPreviousFingerprint(
        wrapper: DocumentWrapper,
        typeInfo: ExportTypeInfo,
    ): FingerprintInfo? = wrapper.fingerprint?.find { it.exportType == typeInfo.type }
}
