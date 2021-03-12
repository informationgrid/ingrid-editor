package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class Published : QuickFilter() {
    override val id = "selectPublished"
    override val label = "Nur veröffentlichte"
    override val filter = ""
}

