package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.intellij.lang.annotations.Language
import org.springframework.stereotype.Component

@Component
class TimeSpan : QuickFilter() {
    override val id = "selectTimespan"
    override val label = "<group label will be used>"

    override val parameters: List<String> = emptyList()


    override fun filter(parameter: Any?): String {
        if (parameter == null) return "true"
        parameter as List<*>
        val start = parameter[0]
        val end = parameter[1]
        if (start == null && end == null) {
            return "true"
        } else if (start == null) {
            return toFilter
        } else if (end == null) {
            return fromFilter
        }
        return this.filter
    }


    //    @Language("PostgreSQL")
    override val filter =
        """document1.modified BETWEEN ?\:\:timestamp AND ?\:\:timestamp"""

    val fromFilter =
        """document1.modified >= ?\:\:timestamp"""
    val toFilter =
        """document1.modified <= ?\:\:timestamp"""

}
