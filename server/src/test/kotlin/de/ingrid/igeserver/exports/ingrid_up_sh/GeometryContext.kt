package de.ingrid.igeserver.exports.ingrid_up_sh

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ingrid.Geodataset
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.profiles.ingrid_up_sh.exporter.UPSHProfileTransformer
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain

class GeometryContext : Geodataset() {

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter.profileTransformer = UPSHProfileTransformer()
    }


    init {
        should("export geometry context of type 'other'") {
            val context = jacksonObjectMapper().readTree(
                """{
                    "geometryContext": [{
                        "name": "test-name",
                        "dataType": "test-datatype",
                        "description": "test-description",
                        "featureType": {
                          "key": "other"
                        },
                        "geometryType": "test-geometryType",
                        "min": 3,
                        "max": 12,
                        "unit": "test-unit",
                        "attributes": [
                            {
                                "key": "1",
                                "value": "one"
                            },
                            {
                                "key": "2",
                                "value": "two"
                            }
                        ]
                      }]
                    }""".trimIndent()
            ) as ObjectNode

            val result = exportJsonToXML(exporter, "/export/ingrid/geo-dataset.minimal.sample.json", context)

            result shouldContain geometryContextOther
        }
        
        should("export geometry context of type 'nominal'") {
            val context = jacksonObjectMapper().readTree(
                """{
                    "geometryContext": [{
                        "name": "test-name",
                        "dataType": "test-datatype",
                        "description": "test-description",
                        "featureType": {
                          "key": "nominal"
                        },
                        "geometryType": "test-geometryType",
                        "min": 3,
                        "max": 12,
                        "unit": "test-unit",
                        "attributes": [
                            {
                                "key": "1",
                                "value": "one"
                            },
                            {
                                "key": "2",
                                "value": "two"
                            }
                        ]
                      }]
                    }""".trimIndent()
            ) as ObjectNode

            val result = exportJsonToXML(exporter, "/export/ingrid/geo-dataset.minimal.sample.json", context)

            result shouldContain geometryContextNominal
        }
    }
}