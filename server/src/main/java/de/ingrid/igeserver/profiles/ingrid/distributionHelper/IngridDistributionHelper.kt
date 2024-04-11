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
package de.ingrid.igeserver.profiles.bmi.distributionHelper

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ogc.distributionHelper.OgcDistributionHelper
import de.ingrid.igeserver.ogc.distributionHelper.DistributionTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.mdek.upload.storage.Storage
import org.jetbrains.kotlin.utils.addToStdlib.ifFalse
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Profile("ogc-distributions-api & ingrid")
@Service
class IngridDistributionHelper(
    private val storage: Storage
): OgcDistributionHelper {

    override val typeInfo: DistributionTypeInfo
        get() = DistributionTypeInfo(
            "ingrid",
            "Ingrid",
            description = "Ingrid distribution Helper",
            emptyList()
        )

    override fun canHandleDistribution(profile: String): Boolean {
        return "ingrid" == profile
    }

    override fun getDistributionDetails(document: Document, collectionId: String, recordId: String, distributionId: String?): JsonNode {
        val allDistributions = document.data["graphicOverviews"]

        return if (distributionId.isNullOrEmpty()) {
            allDistributions
        } else {
            val filteredDistributions = allDistributions.filter() { it["fileName"]["uri"].textValue() == distributionId }
            convertListToJsonNode(filteredDistributions)
        }
    }

    override fun searchForMissingFiles(
        distributions: JsonNode,
        collectionId: String,
        userID: String,
        recordId: String,
        distributionId: String?
    ): List<String> {
        val missingFiles: MutableList<String> = mutableListOf()

        distributions.forEach() { distribution ->
            val currentDistributionId = distribution["fileName"]["uri"].textValue()
            val isLink = distribution["fileName"]["asLink"].asBoolean()
            isLink.ifFalse {
                val distributionExists = storage.exists(collectionId, userID, recordId, currentDistributionId)
                distributionExists.ifFalse { missingFiles.add(currentDistributionId) }
            }
        }

        return missingFiles
    }

    private fun convertListToJsonNode(listOfJsonNodes: List<Any>): JsonNode {
        val objectMapper: ObjectMapper = jacksonObjectMapper()
        return objectMapper.valueToTree(listOfJsonNodes)
    }

}