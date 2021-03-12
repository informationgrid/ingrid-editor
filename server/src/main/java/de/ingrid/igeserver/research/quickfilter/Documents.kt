package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class Documents : QuickFilter() {
    override val id = "selectDocuments"
    override val label = "Dokument"
    override val filter = "category = 'data'"
}

