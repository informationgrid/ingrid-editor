/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.extension.pipe.impl

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.kotlin.logger
import java.security.Principal
import java.util.*

/**
 * Default implementation of a filter context
 */
open class DefaultContext(
    override val catalogId: String, 
    override val profile: String,
    override val parentProfile: String?, 
    override val principal: Principal?
) : Context {

    companion object {
        /**
         * Create an instance with the profile of the currently opened catalog (database)
         */
        fun withCurrentProfile(
            catalogId: String,
            catalogService: CatalogService,
            principal: Principal?
        ): DefaultContext {
            val profile = catalogService.getProfileFromCatalog(catalogId)
            return DefaultContext(catalogId, profile.identifier, profile.parentProfile, principal)
        }
    }

    private val messages: Queue<Message> = LinkedList()
    private val log = logger()

    override fun addMessage(msg: Message) {
        log.debug(msg)
        messages.add(msg)
    }

    override fun clearMessages() {
        messages.clear()
    }

    override fun messages(): Iterable<Message> {
        return messages.asIterable()
    }

    override var properties: Map<String, Any?> = mutableMapOf()
}

class SimpleContext(override val catalogId: String, override val profile: String, val uuid: String) :
    DefaultContext(catalogId, profile, null, null)
