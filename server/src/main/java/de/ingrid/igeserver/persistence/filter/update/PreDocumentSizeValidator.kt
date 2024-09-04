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
package de.ingrid.igeserver.persistence.filter.update

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PreUpdatePayload
import org.springframework.stereotype.Component

/**
 * Filter for processing document data send from the client before publish
 */
@Component
class PreDocumentSizeValidator : Filter<PreUpdatePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()
        private const val MAXIMUM_DOCUMENT_SIZE = 32000000 // 32MB
    }

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PreUpdatePayload, context: Context): PreUpdatePayload {
        val lengthInBytes = jacksonObjectMapper().writeValueAsString(payload.document).length
        if (lengthInBytes > MAXIMUM_DOCUMENT_SIZE) {
            throw ClientException.withReason("Document too big! Max content is 32MB")
        }

        return payload
    }
}
