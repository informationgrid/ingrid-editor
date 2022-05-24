package de.ingrid.igeserver.profiles.uvp.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class TitleSearch : QuickFilter() {
    override val id = "titleSearch"
    override val label = "Nur im Titel suchen"
    override val filter = ""
    override val isFieldQuery = true
}