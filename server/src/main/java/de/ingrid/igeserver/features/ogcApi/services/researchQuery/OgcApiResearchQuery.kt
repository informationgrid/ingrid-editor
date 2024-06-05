/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.features.ogcApi.services.researchQuery

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import java.time.Instant

data class OgcFilterParameter(
    val queryLimit: Int,
    val queryOffset: Int,
    val type: List<String>?,
    val bbox: List<Float>?,
    val datetime: String?,
    val qParameter: List<String>?
)

abstract class OgcApiResearchQuery {
    abstract val profiles: List<String>

    abstract var ogcParameter: OgcFilterParameter

    abstract fun profileSpecificClauses(): MutableList<BoolFilter>?

    fun profiles(): List<String> { return profiles }

    private fun ogcDateTimeConverter(datetime: String): List<String> {
        val dateArray = datetime.split("/")
        var dateList = dateArray.map { date -> if (date == "..") null else checkDatetime(date) }
        return dateArray
    }

    private fun checkDatetime(date: String): String {
        val instance: Instant
        try {
            instance = Instant.parse(date)
        } catch (ex: AccessDeniedException) {
            throw ClientException.withReason("Malformed request syntax of DateTime:  $date")  // how to throw correct error ?
        }

        return instance.toString()
    }

    private fun clauses(ogcParameter: OgcFilterParameter): MutableList<BoolFilter> {
        val clausesList: MutableList<BoolFilter> = mutableListOf()
        // filter: exclude FOLDERS
        clausesList.add(BoolFilter("OR", listOf("exceptFolders"), null, null, true))

        clausesList.add(BoolFilter("OR", listOf("document1.state = 'PUBLISHED'"), null, null, false))
        // bbox // check if 4 values is true
        if (ogcParameter.bbox != null) {
            val boundingBox = ogcParameter.bbox.map { coordinate -> coordinate.toString() }
            clausesList.add(BoolFilter("OR", listOf("ingridSelectSpatial"), null, boundingBox, true))
        }
        // time span
        if (ogcParameter.datetime != null) {
            val dateList = ogcDateTimeConverter(ogcParameter.datetime)
            clausesList.add(BoolFilter("OR", listOf("selectTimespan"), null, dateList, true))
        }
        // filter by doc type
        if (ogcParameter.type != null) {
            val typeList = mutableListOf<String>()
            for (name in ogcParameter.type) {
                typeList.add("document_wrapper.type = '${name}'")
            }
            clausesList.add(BoolFilter("OR", typeList, null, null, false))
        }

        val profileSpecificClausesList = profileSpecificClauses()

        if (profileSpecificClausesList != null) {
            clausesList.addAll(profileSpecificClausesList)
        }

        return clausesList
    }

    fun createQuery(ogcFilterParameter: OgcFilterParameter): ResearchQuery {
        ogcParameter = ogcFilterParameter
        return ResearchQuery(
            term = null,
            clauses = BoolFilter(op = "AND", value = null, clauses = clauses(ogcFilterParameter), parameter = null, isFacet = true),
            pagination = ResearchPaging(1, ogcParameter.queryLimit, ogcParameter.queryOffset)
        )
    }
}