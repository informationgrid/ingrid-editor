package de.ingrid.igeserver.research.quickfilter.address

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class Persons : QuickFilter() {
    override val id = "selectPersons"
    override val label = "Person"
    override val filter = "(category = 'address') AND ((data ->> 'organization') = '') IS NOT FALSE"
}
