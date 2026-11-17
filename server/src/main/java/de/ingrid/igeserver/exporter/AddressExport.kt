/*
 * ==================================================
 * Copyright (C) 2025-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.exporter

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.model.AddressRefModel
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.log
import de.ingrid.igeserver.utils.checkPublicationTags
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.time.OffsetDateTime

class AddressExport(val config: GeneralTransformerConfig, val mapPointOfContactMD: Boolean = false) {
    fun toAddressModelTransformer(it: AddressRefModel): AddressModelTransformer? {
        val lastPublishedDoc =
            getLastPublishedDocument(it.ref ?: throw ServerException.withReason("Address-Reference UUID is NULL"))

        // filter out addresses with wrong tags
        if (lastPublishedDoc != null) {
            kotlin.runCatching {
                checkPublicationTags(
                    config.documentService.getWrapperById(lastPublishedDoc.wrapperId!!).tags,
                    config.tags,
                )
            }
                .onFailure { return null }
        }

        // if no lastPublishedDoc is found, create a dummy address with the type "null-address"
        val doc = lastPublishedDoc ?: Document().apply {
            data = jacksonObjectMapper().createObjectNode()
            type = "null-address"
            modified = OffsetDateTime.now()
            wrapperId = -1
        }
        return AddressModelTransformer(
            AddressTransformerConfig(
                config.catalogIdentifier,
                config.codelists,
                // Map pointOfContactMD type to pointOfContact for ISO Exports
                if (!mapPointOfContactMD || it.type?.key != "12") it.type else KeyValue("7", "pointOfContact"),
                doc,
                config.documentService,
                config.uploadConfig,
                config.tags,
            ),
        )
    }

    fun getLastPublishedDocument(uuid: String): Document? {
        if (config.cache.documents.containsKey(uuid)) return config.cache.documents[uuid]
        return try {
            config.documentService.getLastPublishedDocument(config.catalogIdentifier, uuid, forExport = true)
                .also { config.cache.documents[uuid] = it }
        } catch (_: Exception) {
            log.warn("Could not get last published document: $uuid")
            null
        }
    }
}
