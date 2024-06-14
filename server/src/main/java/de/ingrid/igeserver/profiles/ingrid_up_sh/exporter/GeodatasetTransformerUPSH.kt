/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_up_sh.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodatasetModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.GeometryContext
import de.ingrid.igeserver.profiles.ingrid.exporter.GeometryContextAttribute
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.utils.getDouble
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty

class GeodatasetTransformerUPSH(transformerConfig: TransformerConfig) : GeodatasetModelTransformer(transformerConfig) {

    private val docData = doc.data

    override fun getGeometryContexts(): List<GeometryContext> {
        return docData.get("geometryContext")
            ?.map { convertToGeometryContext(it) } ?: emptyList()
    }

    private fun convertToGeometryContext(item: JsonNode): GeometryContext {
        val featureType = mapFeatureType(item.getStringOrEmpty("featureType.key"))
        return GeometryContext(
            item.getStringOrEmpty("geometryType"),
            item.getStringOrEmpty("name"),
            featureType,
            if (featureType == "OtherFeature") "OtherFeatureAttribute" else "RegularFeatureAttribute",
            if (featureType == "OtherFeature") "attributeContent" else "attributeCode",
            item.getStringOrEmpty("dataType"),
            item.getStringOrEmpty("description"),
            item.get("attributes")?.asIterable()?.map {
                GeometryContextAttribute(it.getStringOrEmpty("key"), it.getStringOrEmpty("value"))
            } ?: emptyList(),
            item.getDouble("min"),
            item.getDouble("max"),
            item.getString("unit"),
        )
    }

    private fun mapFeatureType(type: String): String {
        return when (type) {
            "nominal" -> "NominalFeature"
            "ordinal" -> "OrdinalFeature"
            "scalar" -> "ScalarFeature"
            "other" -> "OtherFeature"
            else -> "OtherFeature"
        }
    }
}