package de.ingrid.igeserver.research.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class TimeSpan : QuickFilter() {
    override val id = "selectTimespan"
    override val label = "<group label will be used>"

    override val parameters: List<String> = emptyList()


    override fun filter(parameter: List<*>?): String {
        // returns true if the filter should not be applied. results in sql query ".. AND (true) AND"
        if (parameter == null) return "true"
        val start = parameter[0] as String?
        val end = parameter[1] as String?
        if (start == null && end == null) {
            return "true"
        } else if (start == null) {
            return toFilter.replace("?", end!!)
        } else if (end == null) {
            return fromFilter.replace("?", start)
        }
        return this.filter
            .replace("?1", start)
            .replace("?2", end)
    }


    //    @Language("PostgreSQL")
    override val filter =
        """document1.modified BETWEEN CAST('?1' as timestamp) AND CAST('?2' as timestamp)"""

    val fromFilter =
        """document1.modified >= CAST('?' as timestamp)"""
    val toFilter =
        """document1.modified <= CAST('?' as timestamp)"""

}
