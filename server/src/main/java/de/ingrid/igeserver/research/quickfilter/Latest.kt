package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class Latest : QuickFilter() {
    override val id = "selectLatest"
    override val label = "neueste Version"
    override val filter = ""
}

