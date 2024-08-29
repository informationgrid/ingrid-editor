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
package de.ingrid.igeserver.profiles.mcloud.types

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.getString
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import java.net.URLDecoder

@Component
class MCloudType : EntityType() {
    override val className = "mCloudDoc"
    override val profiles = arrayOf("mcloud", "test")

    val log = logger()

    override val jsonSchema = "/mcloud/schemes/mcloud.schema.json"

    override fun getUploads(doc: Document): List<String> {
        return doc.data.get("distributions")
            ?.filter { download -> !(download.getBoolean("link.asLink") ?: false) }
            ?.map { download -> getUploadFile(download) } ?: emptyList()
    }

    private fun getUploadFile(download: JsonNode): String {
        return if (download.get("link").get("uri") != null) {
            URLDecoder.decode(download.getString("link.uri")!!, "utf-8")
        } else {
            download.get("link").get("value").textValue()
        }
    }

    override fun getReferenceIds(doc: Document): List<String> {
        return doc.data.path("addresses").map { address ->
            address.getString("ref")!!
        }
    }
}
