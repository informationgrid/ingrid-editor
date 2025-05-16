/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_lubw.pipes

import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.mail.EmailServiceImpl
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid_lubw.LubwSkdvOkProperties
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.DocumentState
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import java.net.URI
import java.text.MessageFormat
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.*

@Service
class PublishEmailService(
    val emailService: EmailServiceImpl,
    val properties: LubwSkdvOkProperties,
    val generalProperties: GeneralProperties,
    @Lazy val documentService: DocumentService,
) {
    private val germanFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")
    private val germanFormatterOnlyDate = DateTimeFormatter.ofPattern("dd.MM.yyyy")

    fun sendEmail(doc: Document, catalogId: String, publishDate: Date? = null) {
        val subject = prepareSubject(doc, catalogId)
        val content = prepareContent(doc, publishDate)

        emailService.sendHTMLEmail(properties.publishEmailTo, subject, content)
    }

    private fun prepareContent(
        doc: Document,
        publishDate: Date?,
    ): String {
        val whenInfo = if (publishDate != null) {
            val date = publishDate.toInstant().atZone(ZoneId.systemDefault()).toOffsetDateTime().format(germanFormatterOnlyDate)
            " (zeitgesteuert: $date)"
        } else {
            ""
        }

        return MessageFormat.format(
            properties.publishEmailContent,
            generateLink(doc),
            doc.uuid,
            doc.contentmodifiedby,
            doc.contentmodified!!.format(germanFormatter) + whenInfo,
        )
    }

    private fun generateLink(document: Document): String {
        val url = URI(generalProperties.host).toURL()
        return "<a href='${url.protocol}://${url.host}/trefferanzeige?docuuid=${document.uuid}'>${document.title}</a>"
    }

    private fun prepareSubject(
        doc: Document,
        catalogId: String,
    ): String {
        val isPending = doc.state == DocumentState.PENDING
        val docVersions = documentService.docWrapperRepo.getAllDocumentVersions(doc.wrapperId!!)
        val firstPublish = if (isPending) {
            // dataset is not yet published
            // it's first published when:
            //  * latest version is draft
            docVersions.first().state == DocumentState.DRAFT
        } else {
            // dataset has already been published
            // it's first published when:
            //  * only one version exists
            //  * previous version was not published (archived-state) (e.g. withdrawn)
            docVersions.size == 1 || docVersions[1].state != DocumentState.ARCHIVED
        }
        return "${if (firstPublish) "Erstveröffentlichung" else "Aktualisierung"}: ${doc.title}"
    }
}
