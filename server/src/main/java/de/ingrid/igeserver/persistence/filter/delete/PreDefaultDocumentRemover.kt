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
package de.ingrid.igeserver.persistence.filter.delete

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PreDeletePayload
import org.springframework.stereotype.Component

/**
 * Filter for processing document data send from the client before delete
 */
@Component
class PreDefaultDocumentRemover : Filter<PreDeletePayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PreDeletePayload, context: Context): PreDeletePayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Process document data '$docId' before delete"))

        // call entity type specific hook
        payload.type.onDelete(payload.document)

        return payload
    }
}
