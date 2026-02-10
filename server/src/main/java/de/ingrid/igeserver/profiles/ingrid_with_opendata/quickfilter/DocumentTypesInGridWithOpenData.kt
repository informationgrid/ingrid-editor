package de.ingrid.igeserver.profiles.ingrid_with_opendata.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class DocumentTypesInGridWithOpenData : QuickFilter() {
    override val id = "selectOpenDataDocumentType"
    override val label = ""
    override val filter: String = ""

    override fun filter(parameter: List<*>?) = "document1.type = '${parameter?.get(0)}'"
    override val parameters = listOf(
        "InGridSpecialisedTask",
        "InGridGeoDataset",
        "InGridPublication",
        "InGridGeoService",
        "InGridProject",
        "InGridDataCollection",
        "InGridInformationSystem",
        "OpenDataDoc",
    )
}
