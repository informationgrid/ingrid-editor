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
package de.ingrid.igeserver.ogc.distributionHelper

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.context.annotation.Profile

@Profile("ogc-distributions-api")
interface OgcDistributionHelper {

    val typeInfo: DistributionTypeInfo

    /**
     * Request information about specific distribution and/or all distributions of a document.
     * @param document is Ige Document
     * @param distributionId is URI of a distribution (file uri or link uri)
     * @return JsonNode with info about distribution & ArrayNode of distributions of document
     */
    fun getDistributionDetails(document: Document, collectionId: String, recordId: String, distributionId: String?): JsonNode

    /**
     * Check if files exist AND if distributions are listed in document.
     * @param distributions JsonNode with info about distribution & ArrayNode of distributions of document
     * @param collectionId is catalog identifier
     * @param userID is user identifier
     * @param recordId is document identifier
     * @param distributionId is URI of a distribution (file uri or link uri)
     * @return List of missing files (URIs).
     */
    fun searchForMissingFiles(distributions: JsonNode, collectionId: String, userID: String, recordId: String, distributionId: String?): List<String>

    /**
     * Check if a given distribution can be handled by this distribution helper.
     * This is needed to automatically determine which distribution helper can be used.
     *
     * @param profile is the file type
     * @param fileContent is the content of the file as a simple string
     * @return true if distribution can be handled, otherwise false
     */
    fun canHandleDistribution(profile: String): Boolean
}