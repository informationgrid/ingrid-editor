package de.ingrid.igeserver.profiles.ingrid.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class DocumentTypes : QuickFilter() {
    override val id = "selectInGridDocumentType"
    override val label = ""
    override val filter: String = ""

    override fun filter(parameter: List<*>?) = "document1.type = '${parameter?.get(0)}'"
    override val parameters = listOf(
        "InGridSpecialisedTask", "InGridGeoDataset", "InGridLiterature", "InGridGeoService", "InGridProject", "InGridDataCollection", "InGridInformationSystem"
    )
}
