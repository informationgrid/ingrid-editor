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
package de.ingrid.igeserver.profiles.uvp.importer.dcatapeia

import com.wemove.dcatparser.dcatapeia.model.dcat.Dataset
import com.wemove.dcatparser.dcatapeia.model.dct.Location
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.exports.iso.Contact
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import java.util.UUID
import kotlin.collections.List

data class DcatApEiaDto(
    val _type: String,
    val _uuid: String,
    val title: String?,
    val description: String?,
    val receiptDate: String,
    val prelimAssessment: Boolean,
    val eiaNumbers: List<KeyValue>?,
    val spatial: List<Spatial>?,
    val pointOfContact: List<Contact>?,
)

data class Spatial(
    val type: String?,
    val title: String?,
    val value: Bbox?,
    val wkt: String?,
)

data class Bbox(
    val lat1: Number,
    val lat2: Number,
    val lon1: Number,
    val lon2: Number,
)

class DcatApEiaMapper(
    var dataset: Dataset,
    var catalogId: String,
    val catalogService: CatalogService,
    val behaviourService: BehaviourService,
    var codelistHandler: CodelistHandler,
) {

    fun getDocument(): DcatApEiaDto = DcatApEiaDto(
        _type = _type,
        _uuid = _uuid,
        title = title,
        description = description,
        receiptDate = receiptDate,
        prelimAssessment = prelimAssessment,
        eiaNumbers = eiaNumbers,
        spatial = spatial,
        pointOfContact = pointOfContact,
    )

    @Suppress("PropertyName")
    val _type: String = "UvpApprovalProcedureDoc"

    @Suppress("PropertyName")
    val _uuid: String = dataset.identifier?.first() ?: UUID.randomUUID().toString()

    val title = dataset.title?.firstOrNull() ?: throw ClientException.withReason("DCAT-AP.EIA field 'dct:title' is missing.")

    val description = dataset.description?.firstOrNull()?.trimIndent()?.trim()

    val receiptDate = dataset.receiptDate?.toString() ?: ""

    val prelimAssessment: Boolean = dataset.prelimAssessment

    val pointOfContact: List<Contact>? = run {
        // TODO How to map contacts? -> dcat:contactPoint -> vcard:Organization
        // val mail = dataset.contactPoint?.firstOrNull()?.email
        listOf()
    }

    val spatial: List<Spatial> = run {
        val location = dataset.spatial.firstOrNull() as? Location
        val spatial = Spatial(
            type = "free",
            title = location?.geographicName as String,
            value = polygonToBbox(location.bbox.toString()),
            wkt = location.bbox.toString(),
//            ars = null,
        )
        listOf(spatial)
    }

    fun polygonToBbox(wkt: String): Bbox {
        val coordsPart = wkt
            .removePrefix("POLYGON ((")
            .removeSuffix("))")

        val coords = coordsPart.split(",").map { pair ->
            val (lon, lat) = pair.trim().split(" ")
            lon.toDouble() to lat.toDouble()
        }

        val lons = coords.map { it.first }
        val lats = coords.map { it.second }

        return Bbox(
            lat1 = lats.minOrNull()!!,
            lat2 = lats.maxOrNull()!!,
            lon1 = lons.minOrNull()!!,
            lon2 = lons.maxOrNull()!!,
        )
    }

    val eiaNumbers: List<KeyValue>? = run {
        // TODO Load language from catalog and include in codelist request
        val catalog = catalogService.getCatalogById(catalogId)
        val uvpCodelistId = behaviourService.get(catalogId, "plugin.uvp.eia-number")?.data?.get("uvpCodelist")?.toString() ?: "9000"
        val eiaNumbers: List<KeyValue>? = dataset.number?.map { value ->
            val key = codelistHandler.getCodeListEntryId(uvpCodelistId, value, "de") ?: throw ClientException.withReason("Element '<eia:number>' of request body contains invalid value '$value'. It does NOT match a codelist entry.")
            KeyValue(key, value, uvpCodelistId)
        }
        eiaNumbers
    }
}
