package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class DocMCloud : QuickFilter {
    override val id = "selectDocMCloud"
    override val label = "mCLOUD"
    override val filter = "document1.type = 'mCloudDoc'"
}

