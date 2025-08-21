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

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.wemove.dcatparser.dcatapde.model.vcard.Kind
import com.wemove.dcatparser.dcatapeia.model.dcat.Dataset
import com.wemove.dcatparser.dcatapeia.model.dct.Location
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.exporter.model.AddressRefModel
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.AddressInfo
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.Communication
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport.JsonStringOutput
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.PointOfContact
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ResearchService
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import java.util.*

data class DcatApEiaDto(
    val _type: String,
    val _uuid: String,
    val title: String?,
    val description: String?,
    val receiptDate: String,
    val prelimAssessment: Boolean,
    val eiaNumbers: List<KeyValue>?,
    val spatial: List<Spatial>?,
    val pointOfContact: List<AddressRefModel>?,
)

data class Spatial(
    val type: String?,
    val title: String?,
    val value: Bbox?,
    val wkt: String?,
)

data class Bbox(
    val lat1: Double,
    val lat2: Double,
    val lon1: Double,
    val lon2: Double,
)

class DcatApEiaMapper(
    var dataset: Dataset,
    var catalogId: String,
    val catalogService: CatalogService,
    val behaviourService: BehaviourService,
    var codelistHandler: CodelistHandler,
    val researchService: ResearchService,
    val documentService: DocumentService,
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
        pointOfContact = getPointOfContact(),
    )

    var newAddress: ArrayNode? = null

    private val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    @Suppress("PropertyName")
    private val _type: String = "UvpApprovalProcedureDoc"

    @Suppress("PropertyName")
    private val _uuid: String = dataset.identifier?.first() ?: UUID.randomUUID().toString()

    private val title = dataset.title?.firstOrNull() ?: throw ClientException.withReason("DCAT-AP.EIA field 'dct:title' is missing.")

    private val description = dataset.description?.firstOrNull()?.trimIndent()?.trim()

    private val receiptDate = dataset.receiptDate?.toString() ?: ""

    private val prelimAssessment: Boolean = dataset.prelimAssessment

    private fun getPointOfContact(): List<AddressRefModel> {
        val eiaContact: Kind? = dataset.contactPoint?.firstOrNull()
        val email = eiaContact?.email ?: throw ClientException.withReason("DCAT-AP.EIA field 'vcard:hasEmail' is missing")

        var uuidOfAddressRef: String? = documentService.docRepo.findAddressesByOrganisationEmail(catalogId, email).firstOrNull()

        if (uuidOfAddressRef.isNullOrEmpty()) {
            uuidOfAddressRef = UUID.randomUUID().toString()
            newAddress = convertVcardToAddressJsonDocument(eiaContact, uuidOfAddressRef)
        }

        return listOf(
            AddressRefModel(
                ref = uuidOfAddressRef,
                type = KeyValue(
                    key = "7",
                    value = "Ansprechpartner",
                    _codelistId = "505",
                ),
            ),
        )
    }

    private fun convertVcardToAddressJsonDocument(vcardKind: Kind, refUuid: String): ArrayNode {
        val communicationCodelistId = "4430"
        val communications: MutableList<Communication> = mutableListOf(
            Communication(
                KeyValue("3", "E-Mail", communicationCodelistId),
                vcardKind.email,
            ),
        )
        if (!vcardKind.telephone.isNullOrEmpty()) {
            communications.add(
                Communication(
                    KeyValue("1", "Telefon", communicationCodelistId),
                    vcardKind.telephone,
                ),
            )
        }
        if (!vcardKind.url.isNullOrEmpty()) {
            communications.add(
                Communication(
                    KeyValue("4", "URL", communicationCodelistId),
                    vcardKind.url,
                ),
            )
        }

        val newContact = PointOfContact(
            refUuid,
            "UvpOrganisationDoc",
            communications,
            KeyValue(),
            true,
            vcardKind.fn,
            null,
            address = AddressInfo(
                city = vcardKind.locality,
                street = vcardKind.streetAddress,
                zipCode = vcardKind.postalCode,
                country = KeyValue("276", vcardKind.countryName, "6200"),
                administrativeArea = KeyValue("", vcardKind.region, ""),
                pOBox = "",
                zipPOBox = "",
            ),
            positionName = "",
            hoursOfService = "",
            null, // TODO Add uuid of parent address
        )

        val outputReferences: TemplateOutput = JsonStringOutput()
        templateEngine.render("imports/ingrid/address.jte", mapOf("contacts" to listOf(newContact)), outputReferences)
        return jacksonObjectMapper().readValue(outputReferences.toString(), ArrayNode::class.java)
    }

    val spatial: List<Spatial> by lazy {
        val location = dataset.spatial.firstOrNull() as? Location
        val wktBbox = location?.bbox.toString()
//        val wktGeometry = location?.geometry.toString()
//        val wktCentroid = location?.centroid.toString()
        val spatial = Spatial(
            title = location?.geographicName as String,
            type = "free",
            value = polygonToBbox(wktBbox),
            wkt = wktBbox,
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

    val eiaNumbers: List<KeyValue>? by lazy {
        val catalog = catalogService.getCatalogById(catalogId)
        val uvpCodelistId = behaviourService.get(catalogId, "plugin.uvp.eia-number")?.data?.get("uvpCodelist")?.toString() ?: "9000"
        val eiaNumbers: List<KeyValue>? = dataset.number?.map { value ->
            val key = codelistHandler.getCodeListEntryId(uvpCodelistId, value, catalog.settings.config.language ?: "de") ?: throw ClientException.withReason("Element '<eia:number>' of request body contains invalid value '$value'. It does NOT match a codelist entry.")
            KeyValue(key, value, uvpCodelistId)
        }
        eiaNumbers
    }
}
