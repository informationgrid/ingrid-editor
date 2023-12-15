/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
