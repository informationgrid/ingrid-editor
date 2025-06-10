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
package de.ingrid.igeserver.features.ogc_api_distributions.profiles.ingrid.distribution_helper

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.features.ogc_api_distributions.distribution_helper.DistributionTypeInfo
import de.ingrid.igeserver.features.ogc_api_distributions.distribution_helper.OgcDistributionHelper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.ifFalse
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Profile("ingrid")
@Service
class IngridDistributionHelper(
    private val storage: Storage,
) : OgcDistributionHelper {

    private val mapper = jacksonObjectMapper()

    override val typeInfo: DistributionTypeInfo
        get() = DistributionTypeInfo(
            "ingrid",
            "Ingrid",
            description = "Ingrid distribution Helper",
            emptyList(),
        )

    override fun canHandleDistribution(profile: String): Boolean = "ingrid" == profile

    override fun getDistributionDetails(document: Document, collectionId: String, recordId: String, distributionId: String?): JsonNode {
        val graphicOverviews = document.data["graphicOverviews"] ?: mapper.createArrayNode()
        val fileReferences = document.data["fileReferences"] ?: mapper.createArrayNode()

        val filteredGraphicOverviews = when {
            distributionId.isNullOrEmpty() -> graphicOverviews
            else -> convertListToJsonNode(
                graphicOverviews.filter {
                    it.getBoolean("fileName.asLink") == false && it.getString("fileName.uri") == distributionId
                },
            )
        }

        val filteredFileReferences = when {
            distributionId.isNullOrEmpty() -> fileReferences
            else -> convertListToJsonNode(
                fileReferences.filter {
                    it.getBoolean("link.asLink") == false && it.getString("link.uri") == distributionId
                },
            )
        }

        val resultArray = mapper.createArrayNode()
        resultArray.addAll(filteredGraphicOverviews as ArrayNode)
        resultArray.addAll(filteredFileReferences as ArrayNode)
        return resultArray
    }

    override fun searchForMissingFiles(
        distributions: JsonNode,
        collectionId: String,
        userID: String,
        recordId: String,
        distributionId: String?,
    ): List<String> {
        val missingFiles: MutableList<String> = mutableListOf()

        distributions.forEach { distribution ->
            val currentDistributionId = distribution.getString("fileName.uri")!!
            val isLink = distribution.getBoolean("fileName.asLink")!!
            isLink.ifFalse {
                val distributionExists = storage.exists(collectionId, userID, recordId, currentDistributionId)
                distributionExists.ifFalse { missingFiles.add(currentDistributionId) }
            }
        }

        return missingFiles
    }

    private fun convertListToJsonNode(listOfJsonNodes: List<Any>): JsonNode = jacksonObjectMapper().valueToTree(listOfJsonNodes)
}
