package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.exports.iso.Metadata

class MetadataModel(val metadata: Metadata) {
    val uuid = metadata.fileIdentifier?.text
    val title = metadata.identificationInfo?.serviceIdentificationInfo?.citation?.citation?.title?.text
    val description = ""
    val isInspireIdentified = false
    val isAdVCompatible = false
    val isOpenData = false
    fun getPointOfContacts(): List<PointOfContact> {
        return emptyList()
    }
    
    fun getAdvProductGroups(): List<KeyValue> {
        return emptyList()
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
}

data class PointOfContact(
    val refUuid: String,
    val type: KeyValue
)

data class KeyValue(
    val key: String? = null,
    val value: String? = null,
)