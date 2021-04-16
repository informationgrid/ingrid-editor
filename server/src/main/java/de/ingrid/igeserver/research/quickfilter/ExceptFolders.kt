package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class ExceptFolders : QuickFilter() {
    override val id = "exceptFolders"
    override val label = "Ordner nicht anzeigen"
    override val filter = "document1.type != 'FOLDER'"
}

