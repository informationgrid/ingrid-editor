package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class Addresses : QuickFilter() {
    override val id = "selectAddresses"
    override val label = "Adresse"
    override val filter = "category = 'address'"
}
