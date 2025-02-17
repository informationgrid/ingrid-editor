/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.features.ogc_api_records.services.research_query

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import java.time.Instant
import kotlin.reflect.full.memberProperties

data class OgcFilterParameter(
    val queryLimit: Int,
    val queryOffset: Int,
    val type: List<String>?,
    val bbox: List<Float>?,
    val datetime: String?,
    val qParameter: List<String>?,
)

abstract class OgcApiResearchQuery {
    abstract val profiles: List<String>

    open var unsupportedParameters: List<String> = listOf()

    private fun checkForUnsupportedParameters(ogcFilterParameter: OgcFilterParameter) {
        unsupportedParameters.forEach { unsupportedParameter ->
            val property = OgcFilterParameter::class.memberProperties.find { it.name == unsupportedParameter }
            property?.get(ogcFilterParameter)?.let {
                throw ConfigurationException.withReason("Request parameter '$unsupportedParameter' is not yet supported for current profile. Please remove the parameter.")
            }
        }
    }

    abstract fun profileSpecificClauses(ogcParameter: OgcFilterParameter): MutableList<BoolFilter>?

    fun profiles(): List<String> = profiles

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
            throw ClientException.withReason("Malformed request syntax of DateTime:  $date") // how to throw correct error ?
        }

        return instance.toString()
    }

    private fun clauses(ogcParameter: OgcFilterParameter): MutableList<BoolFilter> {
        val clausesList: MutableList<BoolFilter> = mutableListOf()
        // filter: exclude FOLDERS
        clausesList.add(BoolFilter("OR", listOf("exceptFolders"), null, null, true))

        clausesList.add(BoolFilter("OR", listOf("document1.state = 'PUBLISHED'"), null, null, false))

        ogcParameter.datetime?.let { datetime ->
            val dateList = ogcDateTimeConverter(datetime)
            clausesList.add(BoolFilter("OR", listOf("selectTimespan"), null, dateList, true))
        }

        ogcParameter.type?.let { type ->
            val typeList = type.map { "document_wrapper.type = '$it'" }
            clausesList.add(BoolFilter("OR", typeList, null, null, false))
        }

        profileSpecificClauses(ogcParameter)?.let { clausesList.addAll(it) }

        return clausesList
    }

    fun createQuery(ogcFilterParameter: OgcFilterParameter): ResearchQuery {
        checkForUnsupportedParameters(ogcFilterParameter)
        return ResearchQuery(
            term = null,
            clauses = BoolFilter(op = "AND", value = null, clauses = clauses(ogcFilterParameter), parameter = null, isFacet = true),
            pagination = ResearchPaging(1, ogcFilterParameter.queryLimit, ogcFilterParameter.queryOffset),
        )
    }
}
