package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class Published : QuickFilter() {
    override val id = "selectPublished"
    override val label = "Nur veröffentlichte"
    override val filter = "document1.state = 'PUBLISHED' OR document1.state = 'DRAFT_AND_PUBLISHED'"
}

