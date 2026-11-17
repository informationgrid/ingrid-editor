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
package de.ingrid.igeserver.profiles.ingrid_baw.types

import de.ingrid.igeserver.persistence.model.document.DocStateFilter
import de.ingrid.igeserver.persistence.model.document.IncomingReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.types.InGridBaseType
import de.ingrid.igeserver.profiles.ingrid.types.InGridGeoDatasetType
import de.ingrid.igeserver.profiles.ingrid.types.InGridGeoServiceType
import de.ingrid.igeserver.profiles.ingrid.types.InGridInformationSystemType
import de.ingrid.igeserver.profiles.ingrid.types.InGridProjectType
import de.ingrid.igeserver.profiles.ingrid_baw.BawIncomingReferenceOptions
import de.ingrid.igeserver.profiles.ingrid_baw.BawProfile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

fun InGridBaseType.getBawIncomingRelationSubquery(
    doc: Document,
    options: IncomingReferenceOptions,
    superSubquery: () -> String,
): String {
    val bawOptions = options as? BawIncomingReferenceOptions
    if (bawOptions?.onlyInCoupledResources == true) {
        return "( ${getCoupledResourceFilter(doc)} )"
    }
    if (bawOptions?.literatureReferences == true) {
        return """( data->'literatureReferences' @> '[{"uuid": "${doc.uuid}"}]' )"""
    }
    return superSubquery()
}

@Component
class InGridGeoDatasetTypeBaw(jdbcTemplate: JdbcTemplate) : InGridGeoDatasetType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/baw/geo-dataset_baw.schema.json"
    override val profiles = arrayOf(BawProfile.ID)

    override fun createIncomingReferenceOptions(
        options: List<String>,
        docStateFilter: DocStateFilter,
    ): IncomingReferenceOptions = BawIncomingReferenceOptions(
        docStateFilter = docStateFilter,
        onlyInCoupledResources = options.contains("onlyInCoupledResources"),
        literatureReferences = options.contains("literatureReferences"),
        addStructuralChildren = true,
    )

    override fun getIncomingRelationSubquery(doc: Document, options: IncomingReferenceOptions): String = getBawIncomingRelationSubquery(doc, options) { super.getIncomingRelationSubquery(doc, options) }
}

@Component
class InGridGeoServiceTypeBaw(jdbcTemplate: JdbcTemplate) : InGridGeoServiceType(jdbcTemplate) {
    // TODO: Add schema
    override val jsonSchema = "/ingrid/schemes/baw/placeholder.schema.json"
    override val profiles = arrayOf(BawProfile.ID)

    override fun createIncomingReferenceOptions(
        options: List<String>,
        docStateFilter: DocStateFilter,
    ): IncomingReferenceOptions = BawIncomingReferenceOptions(
        docStateFilter = docStateFilter,
        onlyInCoupledResources = options.contains("onlyInCoupledResources"),
        literatureReferences = options.contains("literatureReferences"),
        addStructuralChildren = true,
    )

    override fun getIncomingRelationSubquery(doc: Document, options: IncomingReferenceOptions): String = getBawIncomingRelationSubquery(doc, options) { super.getIncomingRelationSubquery(doc, options) }
}

@Component
class BawSoftware(jdbcTemplate: JdbcTemplate) : InGridInformationSystemType(jdbcTemplate) {
    // TODO: Add schema
    override val jsonSchema = "/ingrid/schemes/baw/placeholder.schema.json"
    override val profiles = arrayOf(BawProfile.ID)

    override fun createIncomingReferenceOptions(
        options: List<String>,
        docStateFilter: DocStateFilter,
    ): IncomingReferenceOptions = BawIncomingReferenceOptions(
        docStateFilter = docStateFilter,
        onlyInCoupledResources = options.contains("onlyInCoupledResources"),
        literatureReferences = options.contains("literatureReferences"),
        addStructuralChildren = true,
    )

    override fun getIncomingRelationSubquery(doc: Document, options: IncomingReferenceOptions): String = getBawIncomingRelationSubquery(doc, options) { super.getIncomingRelationSubquery(doc, options) }
}

@Component
class BawProject(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    // TODO: Add schema
    override val jsonSchema = "/ingrid/schemes/baw/placeholder.schema.json"
    override val profiles = arrayOf(BawProfile.ID)

    override fun createIncomingReferenceOptions(
        options: List<String>,
        docStateFilter: DocStateFilter,
    ): IncomingReferenceOptions = BawIncomingReferenceOptions(
        docStateFilter = docStateFilter,
        onlyInCoupledResources = options.contains("onlyInCoupledResources"),
        literatureReferences = options.contains("literatureReferences"),
        addStructuralChildren = true,
    )

    override fun getIncomingRelationSubquery(doc: Document, options: IncomingReferenceOptions): String = getBawIncomingRelationSubquery(doc, options) { super.getIncomingRelationSubquery(doc, options) }
}
