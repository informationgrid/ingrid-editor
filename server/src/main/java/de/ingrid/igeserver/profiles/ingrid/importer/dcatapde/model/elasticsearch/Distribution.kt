/**
 * ==================================================
 * Copyright (C) 2022-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.elasticsearch

import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.DocTypeEnum
import java.io.Serializable
import java.time.Instant
import java.util.*

class Distribution : Serializable {
    var accessURL: String? = null

    var downloadURL: String? = null

    var description: String? = null

    var docType: DocTypeEnum? = null

    var format: Array<String> = emptyArray()

    var issued: Instant? = null

    var mapLayerNames: Array<String> = emptyArray()

    var modified: Instant? = null

    var title: String? = null

    var temporal: PeriodOfTime? = null

    override fun equals(o: Any?): Boolean {
        if (this === o) {
            return true
        }
        if (o == null || javaClass != o.javaClass) {
            return false
        }
        val that = o as Distribution
        return accessURL == that.accessURL && downloadURL == that.downloadURL && description == that.description && docType == that.docType && format.contentEquals(
            that.format
        ) && issued == that.issued && mapLayerNames.contentEquals(that.mapLayerNames) && modified == that.modified && title == that.title && temporal == that.temporal
    }

    override fun hashCode(): Int {
        var result = Objects.hash(accessURL, downloadURL, description, docType, issued, modified, title, temporal)
        result = 31 * result + format.contentHashCode()
        result = 31 * result + mapLayerNames.contentHashCode()
        return result
    }

    override fun toString(): String {
        return "Distribution{" +
                "accessURL='" + accessURL + '\'' +
                ", downloadURL='" + downloadURL + '\'' +
                ", description='" + description + '\'' +
                ", docType=" + docType +
                ", format=" + format.contentToString() +
                ", issued=" + issued +
                ", mapLayerNames=" + mapLayerNames.contentToString() +
                ", modified=" + modified +
                ", title='" + title + '\'' +
                ", temporal=" + temporal +
                '}'
    }
}
