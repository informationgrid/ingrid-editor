package de.ingrid.igeserver.features.ogc_api_records.services.formatFactory

import org.springframework.stereotype.Service

@Service
class DcatFormatter : IngridIsoFormatter() {

    override val supportedContent = FormatContentTypes.DCAT

    override fun formatBeforeImport(collectionId: String, data: String, publish: Boolean): String = data
}
