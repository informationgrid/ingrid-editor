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
package de.ingrid.igeserver.profiles.uvp.exporter

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.stereotype.Service

@Service
class IndexExporter(val idfExporter: IDFExporter, val luceneExporter: LuceneExporter, val behaviourService: BehaviourService): IgeExporter {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "indexUvpIDF",
        "UVP IDF (Elasticsearch)",
        "Export von UVP Verfahren ins IDF Format für die Anzeige im Portal ins Elasticsearch-Format.",
        "application/json",
        "json",
        listOf("uvp"),
        isPublic = false,
        useForPublish = true
    )

    override fun exportSql(catalogId: String): String {
        val conditions = mutableListOf<String>()

        var doNotPublishNegativeAssessments = true
        var publishNegativeAssessmentsOnlyWithSpatialReferences = false
        var publishNegativeAssessmentsControlledByDataset = false

        behaviourService.get(catalogId, "plugin.publish.negative.assessment")?.let {
            doNotPublishNegativeAssessments = it.active == null || it.active == false
            publishNegativeAssessmentsOnlyWithSpatialReferences = it.data?.get("onlyWithSpatial") == true
            publishNegativeAssessmentsControlledByDataset = it.data?.get("controlledByDataset") == true
        }

        if (doNotPublishNegativeAssessments) conditions.add("document_wrapper.type != 'UvpNegativePreliminaryAssessmentDoc'")
        if (publishNegativeAssessmentsOnlyWithSpatialReferences) conditions.add("(document_wrapper.type != 'UvpNegativePreliminaryAssessmentDoc' OR (jsonb_path_exists(jsonb_strip_nulls(data), '\$.spatial')))")
        if (publishNegativeAssessmentsControlledByDataset) conditions.add("(document_wrapper.tags IS NULL OR NOT ('{negative-assessment-not-publish}' && document_wrapper.tags))")

        conditions.add("document.state = 'PUBLISHED'")

        return "(${conditions.joinToString(" AND ")})"
    }

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        if (doc.type == "FOLDER") return "{}"

        val idf = idfExporter.run(doc, catalogId, options)
        val luceneDoc = luceneExporter.run(doc, catalogId, options) as String

        val mapper = jacksonObjectMapper()
        val luceneJson = mapper.readValue(luceneDoc, ObjectNode::class.java)
        luceneJson.put("idf", idf as String)
        return luceneJson.toPrettyString()
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }
}
