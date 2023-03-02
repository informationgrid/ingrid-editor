package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class Draft : QuickFilter() {
    override val id = "selectDraft"
    override val label = "Nur Unveröffentlichte"
    override val filter = "(document1.state = 'DRAFT' OR document1.state = 'DRAFT_AND_PUBLISHED')"
}

