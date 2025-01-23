/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.json.JsonMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import de.ingrid.igeserver.services.geothesaurus.BoundingBox
import de.ingrid.igeserver.utils.getDouble
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty
import org.springframework.stereotype.Service
import java.net.URI
import java.net.URLEncoder
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

data class BwastrLocatorSearchResponse(
    val bwastrid: String,
    val concatName: String,
    val start: Double,
    val end: Double,
)

data class BwastrCoordinateResponse(
    val coordinates: List<List<List<Double>>>,
    val bounds: BoundingBox,
)

data class BwastrSection(
    val bwastrid: String,
    val start: Double,
    val end: Double,
)

@Service
class BwastrLocatorService {

    private val searchBaseUrl = "https://via.bund.de/wsv/bwastr-locator/rest/bwastrinfo/query?searchfield=all&searchterm="
    private val coordinateSearchURL = "https://via.bund.de/wsv/bwastr-locator/rest/geokodierung/query"

    fun search(term: String): List<BwastrLocatorSearchResponse> {
        if (term.isEmpty()) return emptyList()
        val response = sendRequest("GET", searchBaseUrl + URLEncoder.encode(term, "UTF-8"))
        val mapper = JsonMapper()
        val result = mapper.readTree(response).get("result")
        return if (result is ArrayNode) {
            result.map {
                BwastrLocatorSearchResponse(
                    bwastrid = it.getString("bwastrid") ?: throw Exception("no bwastrid found in response"),
                    concatName = it.getStringOrEmpty("concat_name"),
                    start = it.getDouble("km_von") ?: 0.0,
                    end = it.getDouble("km_bis") ?: 0.0,
                )
            }
        } else {
            emptyList()
        }
    }

    /**
     *  Get coordinates for a section of a BWaStr
     *  The coordinate reference system is WGS84 (EPSG:4326)
     *  @param section the section to get coordinates for
     *  @return a list of coordinates for the section
     */
    fun getCoordinates(section: BwastrSection): List<List<List<Double>>> {
        val response = sendRequest(
            "POST",
            coordinateSearchURL,
            """
                {
                  "queries":
                  [
                    {
                        "bwastrid": "${section.bwastrid}",
                        "stationierung": {
                            "km_von": ${section.start},
                            "km_bis": ${section.end}
                        },
                        "spatialReference":{"wkid":4326}
                    }
                  ]
                }
            """.trimIndent(),
        )
        val mapper = JsonMapper()
        // expecting only 1 result as there are no multiple queries
        val result = mapper.readTree(response).getPath("result")?.get(0) ?: throw Exception("no result found in BWaStr-Locator response")
        val coordinates = result.getPath("geometry.coordinates") ?: throw Exception("no coordinates found in BWaStr-Locator response")
        // combine  the coordinate arrays for each line in MultiLineString geometry
        return coordinates.map { line ->
            line.map { pair -> pair.map { it.asDouble() } }
        }
    }

    fun sendRequest(method: String, url: String, body: String? = null): String {
        val executor = Executors.newSingleThreadExecutor()
        val request = httpRequest(method, url, body)
        val http = httpClient(executor)

        return http.send(request, HttpResponse.BodyHandlers.ofString()).body()
    }

    private fun httpClient(executor: ExecutorService?) = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(30))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .executor(executor)
        .build()

    private fun httpRequest(method: String, url: String, body: String?): HttpRequest {
        val msgBody =
            if (body == null) HttpRequest.BodyPublishers.noBody() else HttpRequest.BodyPublishers.ofString(body)
        return HttpRequest.newBuilder()
            .method(method, msgBody)
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(60))
            .build()
    }
}
