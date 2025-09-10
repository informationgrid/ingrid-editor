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
package de.ingrid.igeserver.tasks.quartz

import IntegrationTest
import com.fasterxml.jackson.databind.JsonNode
import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import jakarta.persistence.EntityManager
import mockCodelists
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig

@Sql(scripts = ["/test_data-codelist.sql"], config = SqlConfig(encoding = "UTF-8"))
class MigrateCodelistIdsIntoDatasetsTest : IntegrationTest() {

    @MockkBean(relaxed = true)
    lateinit var behaviourService: BehaviourService

    @Autowired
    private lateinit var migrationTask: MigrateCodelistIdsIntoDatasets

    @Autowired
    private lateinit var entityManager: EntityManager

    private val codelistHandler = mockk<CodelistHandler>()

    private lateinit var jobExecutionContext: JobExecutionContext

    @BeforeEach
    fun setUp() {
        jobExecutionContext = mockk<JobExecutionContext>()

        every { jobExecutionContext.jobDetail.jobDataMap } returns JobDataMap()

        mockCodelists(codelistHandler)
    }

    @Test
    fun `migrate codelist ids inside documents for InGrid`() {
        // Setup mock JobDataMap
        every { jobExecutionContext.mergedJobDataMap } returns JobDataMap().apply {
            this.put("catalogId", "test_catalog")
        }

        migrationTask.run(jobExecutionContext)

        // GEOSERVICE
        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1001",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.get("themes").get(0).getString("_codelistId") shouldBe "6100"
                it.get("advProductGroups").get(0).getString("_codelistId") shouldBe "8010"
                it.getPath("service.version")!!.get(0).getString("_codelistId") shouldBe "5153"
                it.getPath("service.operations")!!.get(0).getString("name._codelistId") shouldBe "5120"
                it.getPath("service.classification")!!.get(0).getString("_codelistId") shouldBe "5200"
                it.getPath("spatial.spatialSystems")!!.get(0).getString("_codelistId") shouldBe "100"
                it.getString("service.type._codelistId") shouldBe "5100"
                it.getString("spatial.verticalExtent.Datum._codelistId") shouldBe "101"
                it.getString("spatial.verticalExtent.unitOfMeasure._codelistId") shouldBe "102"
                it.getString("metadata.language._codelistId") shouldBe "99999999"
                // it.getString("dataset.languages") shouldBe "99999999" -> only stored in simple key-form!
                it.getPath("resource.useConstraints")!!.get(0).getString("title._codelistId") shouldBe "6500"
                it.getPath("resource.accessConstraints")!!.get(0).getString("_codelistId") shouldBe "6010"
                it.getPath("temporal.events")!!.get(0).getString("referenceDateType._codelistId") shouldBe "502"
                it.getString("temporal.status._codelistId") shouldBe "523"
                it.getString("temporal.resourceDateType._codelistId") shouldBe null
                it.getPath("references")!!.get(0).getString("type._codelistId") shouldBe "2000"
                it.getPath("references")!!.get(0).getString("urlDataType._codelistId") shouldBe "1320"
                it.getPath("distribution.format")!!.get(0).getString("name._codelistId") shouldBe "1320"
                it.getString("spatialScope._codelistId") shouldBe "6360"
                it.getPath("pointOfContact")!!.get(0).getString("type._codelistId") shouldBe "505"
                it.getPath("pointOfContact")!!.get(1).getString("type._codelistId") shouldBe "505"
                it.getPath("priorityDatasets")!!.get(0).getString("_codelistId") shouldBe "6350"
                it.getPath("conformanceResult")!!.get(0).getString("pass._codelistId") shouldBe "6000"
                it.getPath("conformanceResult")!!.get(0).getString("specification._codelistId") shouldBe "6005"
                it.getPath("digitalTransferOptions")!!.get(0).getString("name._codelistId") shouldBe "520"
                it.getPath("digitalTransferOptions")!!.get(0).getString("transferSize.unit._codelistId") shouldBe null
                it.getString("maintenanceInformation.maintenanceAndUpdateFrequency._codelistId") shouldBe "518"
                it.getString("maintenanceInformation.userDefinedMaintenanceFrequency.unit._codelistId") shouldBe "1230"
                it.getPath("extraInfo.legalBasicsDescriptions")!!.get(0).getString("_codelistId") shouldBe "1350"
                it.getPath("fileReferences")!!.get(0).getString("format._codelistId") shouldBe "1320"
                it.getPath("openDataCategories")!!.get(0).getString("_codelistId") shouldBe "6400"
                it.getPath("hvdCategories")!!.get(0).getString("_codelistId") shouldBe "hvdCategories"
                it.getPath("topicCategories")!!.get(0).getString("_codelistId") shouldBe "527"
                it.getString("metadata.characterSet._codelistId") shouldBe "510"
            }

        // GEODATASET
        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1002",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.getString("properties.subType._codelistId") shouldBe "525"
                it.getPath("pointOfContact")!!.get(0).getString("type._codelistId") shouldBe "505"
                it.getString("publication.generalResourceType._codelistId") shouldBe "3390"
                it.getString("publication.resourceType._codelistId") shouldBe "3386"
                it.getPath("spatialRepresentationType")!!.get(0).getString("_codelistId") shouldBe "526"
                it.getPath("spatialRepresentationType")!!.get(1).getString("_codelistId") shouldBe "526"
                it.getPath("dataQualityInfo.lineage.source.descriptions")!!.get(0)
                    .getString("dateType._codelistId") shouldBe "502"
                it.getPath("portrayalCatalogueInfo.citation")!!.get(0).getString("title._codelistId") shouldBe "3555"
                it.getPath("featureCatalogueDescription.citation")!!.get(0)
                    .getString("title._codelistId") shouldBe "3535"
                it.getPath("featureCatalogueDescription.featureTypes")!!.get(0).getString("_codelistId") shouldBe null
                it.getPath("qualities")!!.get(0).getString("measureType._codelistId") shouldBe "7109"
                it.getPath("qualities")!!.get(1).getString("measureType._codelistId") shouldBe "7127"
                it.getString("vectorSpatialRepresentation.topologyLevel._codelistId") shouldBe "528"
                it.getString("vectorSpatialRepresentation.geometricObjectType._codelistId") shouldBe "515"
                it.getPath("gridSpatialRepresentation.axesDimensionProperties")!!.get(0)
                    .getString("name._codelistId") shouldBe "514"
                it.getString("gridSpatialRepresentation.cellGeometry._codelistId") shouldBe "509"
                it.getString("gridSpatialRepresentation.georectified.pointInPixel._codelistId") shouldBe "2100"
            }

        // PUBLICATION
        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1003",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.getString("publication.documentType._codelistId") shouldBe "3385"
            }

        // ADDRESS
        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1004",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.getPath("contact")!!.get(0).getString("type._codelistId") shouldBe "4430"
                it.getPath("contact")!!.get(1).getString("type._codelistId") shouldBe "4430"
                it.getPath("contact")!!.get(2).getString("type._codelistId") shouldBe "4430"
                it.getPath("contact")!!.get(3).getString("type._codelistId") shouldBe "4430"
                it.getString("address.administrativeArea._codelistId") shouldBe "6250"
                it.getString("address.country._codelistId") shouldBe "6200"
                it.getString("salutation._codelistId") shouldBe "4300"
                it.getString("academic-title._codelistId") shouldBe "4305"
            }

        // INFORMATIONSYSTEM
        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1006",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.getString("serviceType._codelistId") shouldBe "5300"
            }
    }

    @Test
    fun `migrate codelist ids inside documents for InGrid-KRZN`() {
        // Setup mock JobDataMap
        every { jobExecutionContext.mergedJobDataMap } returns JobDataMap().apply {
            this.put("catalogId", "test_catalog-krzn")
        }

        migrationTask.run(jobExecutionContext)

        // KRZN: PUBLICATION
        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1005",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.getString("mapLink._codelistId") shouldBe "10500"
            }
    }

    @Test
    fun `migrate codelist ids inside documents for UVP`() {
        // Setup mock JobDataMap
        every { jobExecutionContext.mergedJobDataMap } returns JobDataMap().apply {
            this.put("catalogId", "test_catalog-uvp")
        }

        every {
            behaviourService.get("test_catalog-uvp", "plugin.uvp.eia-number")?.data?.get("uvpCodelist")?.toString()
        } returns "9003"

        migrationTask.run(jobExecutionContext)

        // KRZN: PUBLICATION
        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1007",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.getPath("eiaNumbers")!!.get(0).getString("_codelistId") shouldBe "9003"
            }
    }

    @Test
    fun `migrate codelist ids inside documents for OpenData`() {
        // Setup mock JobDataMap
        every { jobExecutionContext.mergedJobDataMap } returns JobDataMap().apply {
            this.put("catalogId", "test_catalog-opendata")
        }

        migrationTask.run(jobExecutionContext)

        // KRZN: PUBLICATION
        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1009",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.getPath("hvdCategories")!!.get(0).getString("_codelistId") shouldBe "hvdCategories"
                it.getPath("addresses")!!.get(0).getString("type._codelistId") shouldBe "505"
                it.getPath("distributions")!!.get(0).getString("format._codelistId") shouldBe "20003"
                it.getPath("distributions")!!.get(0).getString("license._codelistId") shouldBe "20004"
                it.getPath("distributions")!!.get(0).getString("availability._codelistId") shouldBe "20005"
//                it.getPath("distributions")!!.get(0).getString("languages._codelistId") shouldBe "20007" // not supported
                it.getString("politicalGeocodingLevel._codelistId") shouldBe "20006"
                it.getString("periodicity._codelistId") shouldBe "518"
            }
    }

    @Test
    fun `migrate codelist ids inside documents for HMDK`() {
        // Setup mock JobDataMap
        every { jobExecutionContext.mergedJobDataMap } returns JobDataMap().apply {
            this.put("catalogId", "test_catalog-hmdk")
        }

        migrationTask.run(jobExecutionContext)

        // KRZN: PUBLICATION
        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1010",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.getPath("informationHmbTG")!!.get(0).getString("_codelistId") shouldBe "informationsgegenstand"
            }
    }

    @Test
    fun `migrate codelist ids inside documents for LfUBayern`() {
        // Setup mock JobDataMap
        every { jobExecutionContext.mergedJobDataMap } returns JobDataMap().apply {
            this.put("catalogId", "test_catalog-lfubayern")
        }

        migrationTask.run(jobExecutionContext)

        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1011",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.getPath("references")!!.get(0).apply {
                    getString("urlDataType.key") shouldBe "27"
                    getString("urlDataType._codelistId") shouldBe "20002"
                }
            }
    }

    @Test
    fun `when no changes then dataset should not change at all`() {
        every { jobExecutionContext.mergedJobDataMap } returns JobDataMap().apply {
            this.put("catalogId", "test_catalog")
        }

        migrationTask.run(jobExecutionContext)

        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1008",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.toPrettyString() shouldEqualJson expectedDataset
            }
    }
}

val expectedDataset = """{
  "title": "full_geodatendienst",
  "themes": [],
  "service": {
    "type": null,
    "version": [],
    "operations": [],
    "resolution": [],
    "classification": null,
    "isAtomDownload": true,
    "coupledResources": [],
    "hasAccessConstraints": false
  },
  "spatial": {
    "references": [
      {
        "ars": "",
        "type": "free",
        "title": "TE, Lübecker Straße, Altstadt, Schwerin, Mecklenburg-Vorpommern, 19053, Deutschland (clothes)",
        "value": {
          "lat1": 53.6279788,
          "lat2": 53.6280788,
          "lon1": 11.409222,
          "lon2": 11.409322
        }
      }
    ],
    "spatialSystems": null,
    "verticalExtent": {
      "maximumValue": 11,
      "minimumValue": 1,
      "unitOfMeasure": null
    }
  },
  "keywords": {
    "free": [],
    "gemet": [],
    "umthes": []
  },
  "metadata": {
    "language": null,
    "characterSet": null
  },
  "resource": {
    "useConstraints": [],
    "accessConstraints": null
  },
  "temporal": {
    "events": [
      {
        "referenceDate": "2023-07-31T22:00:00.000Z",
        "referenceDateType": null
      }
    ],
    "status": null,
    "resourceDateType": null
  },
  "extraInfo": {
    "legalBasicsDescriptions": null
  },
  "properties": {
    "isInspireIdentified": "relevant"
  },
  "references": [
    {
      "url": "https://test.com/my.zip",
      "type": null,
      "title": "Daten zum Download",
      "urlDataType": null,
      "referenceType": "url"
    }
  ],
  "description": "test",
  "distribution": {
    "format": []
  },
  "spatialScope": null,
  "pointOfContact": [
    {
      "ref": "826cd85e-9b65-43f6-b2a7-3f20b57450f4",
      "type": null
    },
    {
      "ref": "83f92167-6606-4182-948c-5747ad608b80"
    }
  ],
  "advProductGroups": [],
  "graphicOverviews": [],
  "conformanceResult": [
    {
      "isInspire": true,
      "specification": null,
      "publicationDate": "2009-10-20T00:00:00.000Z"
    }
  ],
  "digitalTransferOptions": [
    {
      "name": null,
      "transferSize": {
        "unit": null
      }
    }
  ],
  "maintenanceInformation": {
    "maintenanceAndUpdateFrequency": null,
    "userDefinedMaintenanceFrequency": {
      "unit": null,
      "number": 1
    }
  },"fileReferences": [
    {
      "title": "Mein Upload",
      "link": {
        "asLink": false,
        "value": "test.txt",
        "uri": "test.txt",
        "lastModified": "2025-06-12T08:25:45.783Z",
        "sizeInBytes": 292476
      },
      "format": null,
      "description": "test"
    }
  ],
  "openDataCategories": [], "hvdCategories": [], "topicCategories": []
}
""".trimIndent()
