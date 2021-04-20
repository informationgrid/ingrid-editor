package de.ingrid.igeserver.research.quickfilter.address

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class Organisations : QuickFilter() {
    override val id = "selectOrganisations"
    override val label = "Organisation"
    override val filter = "category = 'address' AND document_wrapper.type != 'FOLDER' AND ((data ->> 'organization') = '') IS NOT TRUE"
}
