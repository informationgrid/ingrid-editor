/**
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.schema.ingrid_nlpv

import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe

class InGridGeoDatasetNlpvSchema : AnnotationSpec() {

    private val schema = "/ingrid/schemes/nlpv/geo-dataset_nlpv.schema.json"

    @Test
    fun minimal() {
        var json = SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.minimal.json")
        // geometryContext
        json = json.replaceFirst(
            "{",
            """
            { "geometryContext": [
                {
                  "name": "Mein Kontext",
                  "dataType": "Mein Datentyp",
                  "attributes": [
                    {
                      "key": "1",
                      "value": "Attribut 1"
                    }
                  ],
                  "description": "Meine Beschreibung",
                  "featureType": {
                    "key": "nominal"
                  },
                  "geometryType": "Mein Typ"
                }
              ], 
        """,
        )
        // metadataMaintenance
        json = json.replaceFirst(
            "\"metadata\": {",
            """
            "metadata": {
                "maintenanceInformation": {
                    "maintenanceAndUpdateFrequency": {
                        "key":  "7",
                        "value": "halbj\u00E4hrlich",
                        "_codelistId": "518"
                    },
                    "userDefinedMaintenanceFrequency": {
                        "unit": null
                    },
                    "description": "Eine Beschreibung (maintenanceNote)"
                },
        """,
        )
        val result = SchemaUtils.validate(json, schema)
        result.size shouldBe 0
    }

    @Test
    fun negativeTest() = SchemaUtils.createNegativeTestByAddingInvalidField(schema, "/export/ingrid/geo-dataset.minimal.json")
}
