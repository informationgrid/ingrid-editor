package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.exports.iso.RoleCode
import de.ingrid.igeserver.services.CodelistHandler
import org.apache.logging.log4j.kotlin.logger

class MetadataModel(val metadata: Metadata, val codeListService: CodelistHandler) {

    private val log = logger()

    val uuid = metadata.fileIdentifier?.value
    val type =
        if (metadata.hierarchyLevel?.get(0)?.scopeCode?.codeListValue == "service") "InGridGeoService" else "InGridGeoDataset"
    val title = metadata.identificationInfo[0].serviceIdentificationInfo?.citation?.citation?.title?.value
    val isInspireIdentified = containsKeyword("inspireidentifiziert")
    val isAdVCompatible = containsKeyword("AdVMIS")
    val isOpenData = containsKeyword("opendata")
    val parentUuid = metadata.parentIdentifier?.value

    fun getDescription(): String {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.abstract?.value
            ?.split(";")
            ?.asSequence()
            ?.filterNot { it.trim().startsWith("Maßstab:") }
            ?.filterNot { it.trim().startsWith("Bodenauflösung:") }
            ?.filterNot { it.trim().startsWith("Scanauflösung (DPI):") }
            ?.filterNot { it.trim().startsWith("Systemumgebung:") }
            ?.filterNot { it.trim().startsWith("Erläuterung zum Fachbezug:") }
            ?.toList()
            ?.joinToString(";") ?: ""
    }

    fun getPointOfContacts(): List<PointOfContact> {
        return metadata.contact.map {
            PointOfContact(
                it.responsibleParty?.uuid!!,
                mapRoleToContactType(it.responsibleParty?.role!!)
            )
        }
    }

    private fun mapRoleToContactType(role: RoleCode): KeyValue {
        val value = role.codelist?.codeListValue
        val entryId = codeListService.getCodeListEntryId("505", value, "ISO")
            ?: throw ServerException.withReason("Could not map role of contact type: $value")

        return KeyValue(entryId)
    }

    fun getAdvProductGroups(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.citation?.citation?.alternateTitle
            ?.map { it.value }
            ?.joinToString(";")
            ?.split(";")
            ?.mapNotNull { codeListService.getCodeListEntryId("8010", it, "de") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getAlternateTitle(): String {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.citation?.citation?.alternateTitle
            ?.map { it.value }
            ?.joinToString(";")
            ?.split(";")
            ?.filter { codeListService.getCodeListEntryId("8010", it, "de") == null }
            ?.joinToString(";") ?: ""
    }

    fun getThemes(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "GEMET - INSPIRE themes, version 1.0" }
            ?.map { codeListService.getCodeListEntryId("6100", it.keywords?.keyword?.value, null) }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getPriorityDatasets(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "INSPIRE priority data set" }
            ?.map { codeListService.getCodeListEntryId("6350", it.keywords?.keyword?.value, null) }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getOpenDataCategories(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords
            ?.asSequence()
            ?.filter { it.keywords?.thesaurusName == null }
            ?.filter { it.keywords?.type?.codelist?.codeListValue == "theme" }
            ?.mapNotNull { it.keywords?.keyword?.value }
            ?.map { codeListService.getCodeListEntryIdMatchingData("6400", it) }
            ?.map { KeyValue(it) }
            ?.toList() ?: emptyList()
    }

    fun getSpatialScope(): KeyValue? {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "Spatial scope" }
            ?.mapNotNull { it.keywords?.keyword?.value }
            ?.map { codeListService.getCodeListEntryId("6360", it, null) }
            ?.map { KeyValue(it) }
            ?.getOrNull(0)
    }
    
    fun getGraphicOverviews(): List<PreviewGraphic> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.graphicOverview
            ?.map { 
                PreviewGraphic(it.mdBrowseGraphic?.fileName?.value!!, it.mdBrowseGraphic.fileDescription?.value)
            } ?: emptyList()
    }
    
    data class PreviewGraphic(
        val fileName: String,
        val description: String? = null
    )

    fun getServiceCategories(): List<KeyValue> {
        return emptyList()
    }

    fun getServiceVersions(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.serviceTypeVersion
            ?.map { codeListService.getCodeListEntryId("5153", it.value, "ISO") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getServiceType(): KeyValue {
        val value = metadata.identificationInfo[0].serviceIdentificationInfo?.serviceType?.value
        val id = codeListService.getCodeListEntryId("5100", value, "ISO")
        return KeyValue(id)
    }

    fun getCouplingType(): KeyValue {
        val id = metadata.identificationInfo[0].serviceIdentificationInfo?.couplingType?.code?.codeListValue
        return KeyValue(id)
    }

    fun getSpatialSystems(): List<KeyValue> {
        return metadata.referenceSystemInfo
            ?.map { it.referenceSystem?.referenceSystemIdentifier?.identifier?.code?.value }
            ?.map { codeListService.getCodeListEntryId("100", it, "de") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getSpatialReferences(): List<SpatialReference> {
        val references = mutableListOf<SpatialReference>()

        metadata.identificationInfo[0].serviceIdentificationInfo?.extent?.extend?.geographicElement
            ?.forEach {
                // handle title
                val geoIdentifierCode = it.geographicDescription?.geographicIdentifier?.mdIdentifier?.code
                val title = geoIdentifierCode?.value
                if (title != null) {
                    val isAnchorAndRegionKey = geoIdentifierCode.isAnchor
                    // ignore regional key definition, which is identified by an anchor element
                    if (isAnchorAndRegionKey) return@forEach
                    
                    references.add(SpatialReference("free", title))
                    return@forEach
                }
                
                // handle coordinates
                val bbox = it.geographicBoundingBox
                references.last().coordinates = BoundingBox(
                    bbox?.southBoundLatitude?.value!!,
                    bbox.westBoundLongitude?.value!!,
                    bbox.northBoundLatitude?.value!!,
                    bbox.eastBoundLongitude?.value!!
                )
            }
        return references
    }
    
    val spatialDescription = metadata.identificationInfo[0].serviceIdentificationInfo?.extent?.extend?.description?.value ?: ""

    fun getRegionKey(): String {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.extent?.extend?.geographicElement
            ?.mapNotNull { it.geographicDescription?.geographicIdentifier?.mdIdentifier?.code?.value }
            ?.getOrNull(0) ?: ""
    }

    fun getVerticalExtent(): VerticalExtentModel? {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.extent?.extend?.verticalElement
            ?.mapNotNull {
                val uom = it.verticalElement?.verticalCRS?.verticalCRS?.verticalCS?.verticalCS?.axis?.coordinateSystemAxis?.uom
                val uomId = codeListService.getCodeListEntryId("102", uom, "ISO")
                val min = it.verticalElement?.minimumValue?.value
                val max = it.verticalElement?.maximumValue?.value
                val datum = it.verticalElement?.verticalCRS?.verticalCRS?.verticalDatum?.verticalDatum?.name
                val datumId = codeListService.getCodeListEntryId("101", datum, "de")
                return if (uomId == null || min == null || max == null || datumId == null) null
                else VerticalExtentModel(uomId, min, max, datumId)
            }?.getOrNull(0)
    }
    
    fun getReferenceDateType(): KeyValue {
        return KeyValue()
    }

    fun getLanguage(): KeyValue {
        return KeyValue()
    }

    fun getExtraInfoPublishArea(): KeyValue {
        return KeyValue()
    }

    fun getCoupledResources(): List<CoupledResourceModel> {
        return metadata.distributionInfo?.mdDistribution?.transferOptions
            ?.filter {
                it.mdDigitalTransferOptions?.onLine?.any { online -> online.ciOnlineResource?.applicationProfile?.value == "coupled" }
                    ?: false
            }
            ?.map { CoupledResourceModel("", "?", "", false) } ?: emptyList()
    }


    private fun containsKeyword(value: String): Boolean {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords?.any {
            it.keywords?.keyword?.value == value
        } ?: false
    }
}

data class VerticalExtentModel(
    val uom: String,
    val min: Number,
    val max: Number,
    val datum: String
)

data class SpatialReference(
    val type: String,
    val title: String?,
    var coordinates: BoundingBox? = null
)

data class BoundingBox(
    val lat1: Float,
    val lon1: Float,
    val lat2: Float,
    val lon2: Float
)

data class CoupledResourceModel(
    val uuid: String?,
    val state: String,
    val title: String?,
    val isExternalRef: Boolean,
)

data class PointOfContact(
    val refUuid: String,
    val type: KeyValue
)

data class KeyValue(
    val key: String? = null,
    val value: String? = null,
)