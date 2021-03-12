package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class DocFolder : QuickFilter() {
    override val id = "selectDocFolders"
    override val label = "Ordner"
    override val filter = "document1.type = 'FOLDER'"
}

