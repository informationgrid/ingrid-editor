package de.ingrid.igeserver.exports.ingrid

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import io.kotest.core.spec.IsolationMode
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.every

class DistributionInfo : GeodatasetBase() {

    init {

        isolationMode = IsolationMode.InstancePerTest

        // GEODATASET
        should("create distributionInfo when orderInfo exists (GeoDataset)") {
            val result = exportGeoDataset("""{ "orderInfo": "my order info" }""")

            result shouldContain "<gmd:distributionInfo>"
        }

        should("create distributionInfo when fees exists (GeoDataset)") {
            val result = exportGeoDataset("""{ "fees": "my fees" }""")

            result shouldContain "<gmd:distributionInfo>"
        }

        should("create distributionInfo when distributionFormat is not empty (GeoDataset)") {
            val result = exportGeoDataset(
                """
                    {
                        "distribution": {
                            "format": [
                              {
                                "name": {
                                  "key": "1"
                                }
                              }
                            ]
                        }
                      }
                    """,
            )

            result shouldContain "<gmd:distributionInfo>"
        }

        should("create distributionInfo when digitalTransferOptions is not empty (GeoDataset)") {
            val result = exportGeoDataset(
                """
                    {
                        "digitalTransferOptions": [
                            {
                              "name": {
                                "key": "14"
                              },
                              "transferSize": {
                                "unit": {
                                  "key": "MB"
                                }
                              }
                            }
                        ]
                    }
                    """,
            )

            result shouldContain "<gmd:distributionInfo>"
        }

        should("create distributionInfo when references is not empty (GeoDataset)") {
            val result = exportGeoDataset(
                """
                    {
                        "references": [
                            {
                              "type": {
                                "key": "9990"
                              },
                              "title": "test-title",
                              "url": "https://test.de",
                              "urlDataType": {
                                "key": "2"
                              }
                            }
                        ]
                    }
                    """,
            )

            result shouldContain "<gmd:distributionInfo>"
        }

        should("create distributionInfo when file-references is not empty (GeoDataset)") {
            val result = exportGeoDataset(
                """
                    {
                        "fileReferences": [
                            {
                              "format": {
                                "key": null
                              },
                              "title": "",
                              "description": "",
                              "link": {
                                "asLink": false,
                                "value": "test.json",
                                "uri": "test.json",
                                "lastModified": "2024-09-13T14:01:25.287Z",
                                "sizeInBytes": 4431
                              }
                            }
                        ]
                    }
                    """,
            )

            result shouldContain "<gmd:distributionInfo>"
        }

        should("create distributionInfo when coupled service contains getCapabilities URL (GeoDataset)") {
            val doc = Document().apply {
                title = "Some GeoService"
                type = "InGridGeoService"
                uuid = "12345"
                catalog = Catalog().apply { id = 1 }
                data = jacksonObjectMapper().readValue(
                    """
                    {
                        "service": {
                              "operations": [
                                  {
                                    "name": {
                                      "key": "1"
                                    },
                                    "methodCall": "https://test.com"
                                  }
                              ],
                              "coupledResources": [
                                  {
                                    "uuid": "7abc5862-a893-4a70-8d83-23cf5a2dd264",
                                    "isExternalRef": false
                                  }
                              ]
                        }
                    }
                    """,
                    ObjectNode::class.java,
                )
            }
            every { documentService.getIncomingReferences(any(), "test-catalog") } returns setOf("12345")
            every { documentService.getLastPublishedDocument("test-catalog", "12345", forExport = true) } returns doc

            val result = exportGeoDataset()

            result shouldContain "<gmd:distributionInfo>"
        }

        // GEOSERVICE

        should("create distributionInfo when isAtomDownload (GeoService)") {
            val result = exportGeoService(
                """
                    {
                        "service": {
                              "isAtomDownload": true
                        }
                    }
                    """,
            )

            result shouldContain "<gmd:distributionInfo>"
        }

        should("create distributionInfo when contains getCapabilitiesUrl (GeoService)") {
            val result = exportGeoService(
                """
                    {
                        "service": {
                              "operations": [
                                  {
                                    "name": {
                                      "key": "1"
                                    },
                                    "methodCall": "https://test.com"
                                  }
                              ]
                        }
                    }
                    """,
            )

            result shouldContain "<gmd:distributionInfo>"
        }

        should("create distributionInfo when contains external coupled resource (GeoService)") {
            val result = exportGeoService(
                """
                    {
                        "service": {
                              "coupledResources": [
                                  {
                                    "url": "https://test.com",
                                    "uuid": "AABBF81AC1CF40679C52DDE7F3F1CB02",
                                    "title": "External coupled resource",
                                    "identifier": "ID_EXTERNAL_COUPLED_RESOURCE",
                                    "isExternalRef": true
                                  }
                              ]
                        }
                    }
                    """,
            )

            result shouldContain "<gmd:distributionInfo>"
        }

        should("not create distributionInfo when contains internal coupled resource (GeoService)") {
            val result = exportGeoService(
                """
                    {
                        "service": {
                              "coupledResources": [
                                  {
                                    "uuid": "AABBF81AC1CF40679C52DDE7F3F1CB03",
                                    "isExternalRef": false
                                  }
                              ]
                        }
                    }
                    """,
            )

            result shouldNotContain "<gmd:distributionInfo>"
        }
    }

    private fun exportGeoService(additionalJson: String): String = exportJsonToXML(
        this@DistributionInfo.exporter,
        "/export/ingrid/geo-service.minimal.sample.json",
        jacksonObjectMapper().readValue(
            additionalJson.trimIndent(),
            ObjectNode::class.java,
        ) as ObjectNode,
    ).replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
}
