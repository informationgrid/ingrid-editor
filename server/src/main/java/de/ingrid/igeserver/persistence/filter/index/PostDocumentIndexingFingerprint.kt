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
package de.ingrid.igeserver.persistence.filter.index

import de.ingrid.igeserver.exports.ExporterFactory
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.impl.SimpleContext
import de.ingrid.igeserver.persistence.filter.PostIndexPayload
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.FingerprintInfo
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import java.time.OffsetDateTime

/**
 * Filter for processing steps after removing the document.
 */
@Component
class PostDocumentIndexingFingerprint(
    val documentWrapperRepository: DocumentWrapperRepository,
    val exporterFactory: ExporterFactory
) : Filter<PostIndexPayload> {

    private val log = logger()

    override val profiles = emptyArray<String>()

    override fun invoke(payload: PostIndexPayload, context: Context): PostIndexPayload {
        val exporterType = payload.exportType
        val exporter = exporterFactory.getExporter(DocumentCategory.valueOf(payload.category), exporterType)

        val isoFingerprint = exporter.calculateFingerprint(payload.indexDoc)
        updateFingerprintIfChanged(context, exporterType, isoFingerprint)

        return payload
    }

    private fun updateFingerprintIfChanged(
        context: Context,
        exporterType: String,
        isoFingerprint: String
    ) {
        val catalogIdentifier = context.catalogId
        val uuid = (context as SimpleContext).uuid
        val wrapper = documentWrapperRepository.findByCatalog_IdentifierAndUuid(catalogIdentifier, uuid)

        val fingerprintList = if (wrapper.fingerprint == null) mutableListOf() else wrapper.fingerprint!!

        val previousFingerprint = fingerprintList.find { it.exportType == exporterType }
        if (previousFingerprint?.fingerprint != isoFingerprint) {
            log.debug("Fingerprint changed. Updating metadata-date")
            val publishDate = OffsetDateTime.now()
            wrapper.fingerprint = (fingerprintList.filter { it.exportType != exporterType }) + FingerprintInfo(
                exporterType,
                isoFingerprint,
                publishDate
            )
            documentWrapperRepository.save(wrapper)
        }
    }
}
