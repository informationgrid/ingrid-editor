package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class DocTest : QuickFilter {
    override val id = "selectDocTest"
    override val label = "Test"
    override val filter = "document1.type = 'TestDoc'"
}

