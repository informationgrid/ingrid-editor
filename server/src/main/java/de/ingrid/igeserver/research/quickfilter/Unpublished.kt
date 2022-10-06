package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class Unpublished : QuickFilter() {
    override val id = "selectUnpublished"
    override val label = "Nur Unveröffentlichte"
    override val filter = "document1.state = 'DRAFT'"
}

