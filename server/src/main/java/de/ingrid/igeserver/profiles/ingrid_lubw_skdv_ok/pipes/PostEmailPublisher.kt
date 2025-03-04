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
package de.ingrid.igeserver.profiles.ingrid_lubw_skdv_ok.pipes

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.mail.EmailServiceImpl
import de.ingrid.igeserver.persistence.filter.PostPublishPayload
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid_lubw_skdv_ok.LubwSkdvOkProperties
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.DocumentState
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.stereotype.Component
import java.text.MessageFormat
import java.time.format.DateTimeFormatter

/**
 *
 */
@Component
class PostEmailPublisher(
    val emailService: EmailServiceImpl,
    val documentService: DocumentService,
    val authUtils: AuthUtils,
    val properties: LubwSkdvOkProperties,
) : Filter<PostPublishPayload> {

    override val profiles = emptyArray<String>()

    private val germanFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")

    override fun invoke(payload: PostPublishPayload, context: Context): PostPublishPayload {
        if (!authUtils.isAuthor(context.principal!!)) return payload

        val doc = payload.document

        val subject = prepareSubject(doc, context.catalogId)
        val content = prepareContent(doc, context)

        emailService.sendEmail(properties.publishEmailTo, subject, content)

        return payload
    }

    private fun prepareContent(
        doc: Document,
        context: Context,
    ): String {
        val isPending = doc.state == DocumentState.PENDING
        val editor = context.principal?.name ?: "???"
        val whenInfo = if (isPending) " (zeitgesteuert)" else ""
        return MessageFormat.format(
            properties.publishEmailContent,
            doc.title,
            doc.uuid,
            editor,
            doc.contentmodified!!.format(germanFormatter) + whenInfo,
        )
    }

    private fun prepareSubject(
        doc: Document,
        catalogId: String,
    ): String {
        val isPending = doc.state == DocumentState.PENDING
        val firstPublish = if (isPending) {
            documentService.docWrapperRepo.getDocumentByState(catalogId, doc.uuid, DocumentState.PUBLISHED).isEmpty()
        } else {
            documentService.docWrapperRepo.getDocumentByState(catalogId, doc.uuid, DocumentState.ARCHIVED).isEmpty()
        }
        return "${if (firstPublish) "Erstveröffentlichung" else "Aktualisierung"}: ${doc.title}"
    }
}
