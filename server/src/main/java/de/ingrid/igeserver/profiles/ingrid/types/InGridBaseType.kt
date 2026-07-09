/*
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
package de.ingrid.igeserver.profiles.ingrid.types

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.DocStateFilter
import de.ingrid.igeserver.persistence.model.document.IncomingReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
 * Holds configuration options for retrieving incoming references.
 *
 * @property docStateFilter Specifies a filter to determine the document state to consider when retrieving references.
 * @property onlyInCoupledResources Indicates whether to restrict references to coupled resources only.
 * @property addStructuralChildren Determines whether structural child references should be included. Only works with [onlyInCoupledResources] set to false.
 */
data class IngridIncomingReferenceOptions(
    override val docStateFilter: DocStateFilter = DocStateFilter.LATEST,
    val onlyInCoupledResources: Boolean = false,
    val literatureReferences: Boolean = false,
    val addStructuralChildren: Boolean = false,
) : IncomingReferenceOptions

@Component
abstract class InGridBaseType(val jdbcTemplate: JdbcTemplate) : EntityType() {
    override val profiles = arrayOf("ingrid")

    override fun getReferenceUUIDs(doc: Document): List<String> = doc.data.path("pointOfContact").map { address ->
        address.path("ref").textValue()
    }

    override fun getIncomingReferenceUUIDs(doc: Document, options: IncomingReferenceOptions): List<String> {
        val ingridOptions = options as? IngridIncomingReferenceOptions ?: IngridIncomingReferenceOptions(docStateFilter = options.docStateFilter)
        val sqlQuery = getIncomingReferenceQuery(doc, ingridOptions)
        val result = jdbcTemplate.queryForList(sqlQuery)

        return result.map { it["uuid"] as String }
    }

    override fun getIncomingReferenceQuery(doc: Document, options: IncomingReferenceOptions): String {
        val ingridOptions = options as? IngridIncomingReferenceOptions ?: IngridIncomingReferenceOptions(docStateFilter = options.docStateFilter)
        return """
            SELECT DISTINCT document1.uuid
            FROM document document1, document_wrapper
            WHERE (
                document_wrapper.deleted = 0
                AND document_wrapper.catalog_id = ${doc.catalog!!.id}
                AND document_wrapper.catalog_id = document1.catalog_id
                AND document_wrapper.uuid = document1.uuid
                AND ( ${ingridOptions.docStateFilter.toSql()} )
                AND ( ${getIncomingRelationSubquery(doc, ingridOptions)} )
            )
        """.trimIndent()
    }

    /**
     * Constructs a subquery to retrieve incoming relations for the specified document
     * based on various filtering criteria.
     *
     * @param doc The document for which the incoming relation subquery is to be generated.
     *            Must contain a valid UUID and wrapper ID to build the query.
     * @param options Options that influence the filtering logic of the query.
     * @return A SQL subquery string that can be used to identify documents linked
     *         to the specified document through various relation types.
     */
    private fun getIncomingRelationSubquery(
        doc: Document,
        options: IngridIncomingReferenceOptions
    ): String {
        return getIncomingRelationFilters(doc, options)
            .joinToString(" OR ", "(", ")")
    }

    fun getIncomingRelationFilters(
        doc: Document,
        options: IngridIncomingReferenceOptions
    ): MutableList<String> {
        val coupledResourceFilter =
            """ data->'service'->'coupledResources' @> '[{"uuid": "${doc.uuid}", "isExternalRef": false}]' """
        val referenceFilter = """ data->'references' @> '[{"uuidRef": "${doc.uuid}"}]' """
        val parentIdentifierFilter =  """ data->'parentIdentifier' @> (jsonb('"${doc.uuid}"')) """
        val structuralParentFilter =
            """ ( document_wrapper.parent_id = ${doc.wrapperId} AND document_wrapper.type != 'FOLDER' ) """

        val useFilters = mutableListOf(coupledResourceFilter)

        if (!options.onlyInCoupledResources) {
            useFilters.add(referenceFilter)
            useFilters.add(parentIdentifierFilter)

            if (options.addStructuralChildren) {
                useFilters.add(structuralParentFilter)
            }
        }

        return useFilters
    }

    override fun getUploads(doc: Document): List<String> {
        val graphicOverviews: List<String> = doc.data.get("graphicOverviews")?.let {
            getUploadsFromFileList(it, "fileName")
        } ?: emptyList()

        val fileReferences: List<String> = doc.data.get("fileReferences")?.let {
            getUploadsFromFileList(it, "link")
        } ?: emptyList()

        return graphicOverviews + fileReferences
    }
}
