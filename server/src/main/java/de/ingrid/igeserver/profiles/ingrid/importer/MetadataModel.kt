package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.exports.iso.RoleCode
import org.apache.logging.log4j.kotlin.logger

class MetadataModel(val metadata: Metadata, val codeListService: CodeListService) {

    private val log = logger()

    val uuid = metadata.fileIdentifier?.text
    val title = metadata.identificationInfo[0].serviceIdentificationInfo?.citation?.citation?.title?.text
    val description = metadata.identificationInfo[0].serviceIdentificationInfo?.abstract?.text
    val isInspireIdentified = containsKeyword("inspireidentifiziert")
    val isAdVCompatible = containsKeyword("AdVMIS")
    val isOpenData = containsKeyword("opendata")
    val parentUuid = metadata.parentIdentifier?.text

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
        return metadata.identificationInfo[0].serviceIdentificationInfo?.citation?.citation?.alternateTitle?.text
                ?.split(";")
                ?.mapNotNull { codeListService.getCodeListEntryId("8010", it, "de") }
                ?.map {KeyValue(it)} ?: emptyList()
    }
    
    fun getAlternateTitle(): String {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.citation?.citation?.alternateTitle?.text
            ?.split(";")
            ?.filter { codeListService.getCodeListEntryId("8010", it, "de") == null }
            ?.joinToString(";") ?: ""
    }

    fun getThemes(): List<KeyValue> {
        return emptyList()
    }

    fun getPriorityDatasets(): List<KeyValue> {
        return emptyList()
    }

    fun getServiceCategories(): List<KeyValue> {
        return emptyList()
    }

    fun getServiceVersions(): List<KeyValue> {
        return emptyList()
    }

    fun getServiceType(): KeyValue {
        return KeyValue()
    }

    fun getCouplingType(): KeyValue {
        return KeyValue()
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


    private fun containsKeyword(value: String): Boolean {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords?.any {
            it.keywords?.keyword?.text == value
        } ?: false
    }
}

data class PointOfContact(
    val refUuid: String,
    val type: KeyValue
)

data class KeyValue(
    val key: String? = null,
    val value: String? = null,
)