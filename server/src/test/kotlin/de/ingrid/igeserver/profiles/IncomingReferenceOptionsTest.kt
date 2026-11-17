/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles

import de.ingrid.igeserver.persistence.model.document.DocStateFilter
import de.ingrid.igeserver.persistence.model.document.SimpleIncomingReferenceOptions
import de.ingrid.igeserver.persistence.model.document.impl.AddressType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.types.InGridGeoDatasetType
import de.ingrid.igeserver.profiles.ingrid.types.InGridPublicationType
import de.ingrid.igeserver.profiles.ingrid.types.IngridIncomingReferenceOptions
import de.ingrid.igeserver.profiles.ingrid_baw.BawIncomingReferenceOptions
import de.ingrid.igeserver.profiles.ingrid_baw.types.BawProject
import de.ingrid.igeserver.profiles.ingrid_baw.types.BawPublication
import de.ingrid.igeserver.profiles.ingrid_baw.types.BawSoftware
import de.ingrid.igeserver.profiles.ingrid_baw.types.InGridGeoDatasetTypeBaw
import de.ingrid.igeserver.profiles.ingrid_baw.types.InGridGeoServiceTypeBaw
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.mockk
import org.springframework.jdbc.core.JdbcTemplate
import tools.jackson.module.kotlin.jacksonObjectMapper

class IncomingReferenceOptionsTest : AnnotationSpec() {

    private val jdbcTemplate = mockk<JdbcTemplate>(relaxed = true)

    private fun createTestDoc(uuid: String = "test-doc-uuid", wrapperId: Int = 42): Document {
        val doc = Document().apply {
            this.uuid = uuid
            this.title = "Test Doc"
            this.type = "InGridGeoDataset"
            this.data = jacksonObjectMapper().createObjectNode()
            this.wrapperId = wrapperId
            this.catalog = Catalog().apply {
                this.id = 100
                this.identifier = "test-catalog"
                this.description = "Test Catalog"
                this.name = "Test Catalog"
            }
        }
        return doc
    }

    @Test
    fun `InGridBaseType creates standard IngridIncomingReferenceOptions`() {
        val geoDatasetType = InGridGeoDatasetType(jdbcTemplate)
        val publicationType = InGridPublicationType(jdbcTemplate)

        val optionsGeo = geoDatasetType.createIncomingReferenceOptions(emptyList(), DocStateFilter.LATEST)
        optionsGeo shouldBe IngridIncomingReferenceOptions(docStateFilter = DocStateFilter.LATEST, addStructuralChildren = false)

        val optionsPub = publicationType.createIncomingReferenceOptions(listOf("anyOption"), DocStateFilter.ONLY_PUBLISHED)
        optionsPub shouldBe IngridIncomingReferenceOptions(docStateFilter = DocStateFilter.ONLY_PUBLISHED, addStructuralChildren = false)
    }

    @Test
    fun `InGridBaseType generates correct SQL queries for base options`() {
        val geoDatasetType = InGridGeoDatasetType(jdbcTemplate)
        val doc = createTestDoc("doc-123", 42)

        val queryWithoutStructural = geoDatasetType.getIncomingReferenceQuery(doc, IngridIncomingReferenceOptions(docStateFilter = DocStateFilter.LATEST, addStructuralChildren = false))
        queryWithoutStructural shouldContain "data->'service'->'coupledResources' @> '[{\"uuid\": \"doc-123\", \"isExternalRef\": false}]'"
        queryWithoutStructural shouldContain "data->'references' @> '[{\"uuidRef\": \"doc-123\"}]'"
        queryWithoutStructural shouldContain "data->'parentIdentifier' @> (jsonb('\"doc-123\"'))"
        queryWithoutStructural shouldNotContain "document_wrapper.parent_id = 42"
        queryWithoutStructural shouldNotContain "literatureReferences"

        val queryWithStructural = geoDatasetType.getIncomingReferenceQuery(doc, IngridIncomingReferenceOptions(docStateFilter = DocStateFilter.LATEST, addStructuralChildren = true))
        queryWithStructural shouldContain "document_wrapper.parent_id = 42 AND document_wrapper.type != 'FOLDER'"
        queryWithStructural shouldNotContain "literatureReferences"
    }

    @Test
    fun `BAW doctypes create BawIncomingReferenceOptions with proper flags`() {
        val bawGeoDataset = InGridGeoDatasetTypeBaw(jdbcTemplate)
        val bawPublication = BawPublication(jdbcTemplate)
        val bawGeoService = InGridGeoServiceTypeBaw(jdbcTemplate)
        val bawSoftware = BawSoftware(jdbcTemplate)
        val bawProject = BawProject(jdbcTemplate)

        val defaultOptions = bawGeoDataset.createIncomingReferenceOptions(emptyList(), DocStateFilter.LATEST)
        defaultOptions shouldBe BawIncomingReferenceOptions(
            docStateFilter = DocStateFilter.LATEST,
            onlyInCoupledResources = false,
            literatureReferences = false,
            addStructuralChildren = true,
        )

        val coupledOptions = bawGeoService.createIncomingReferenceOptions(listOf("onlyInCoupledResources"), DocStateFilter.LATEST)
        coupledOptions shouldBe BawIncomingReferenceOptions(
            docStateFilter = DocStateFilter.LATEST,
            onlyInCoupledResources = true,
            literatureReferences = false,
            addStructuralChildren = true,
        )

        val litOptions = bawPublication.createIncomingReferenceOptions(listOf("literatureReferences"), DocStateFilter.LATEST)
        litOptions shouldBe BawIncomingReferenceOptions(
            docStateFilter = DocStateFilter.LATEST,
            onlyInCoupledResources = false,
            literatureReferences = true,
            addStructuralChildren = true,
        )

        val softOptions = bawSoftware.createIncomingReferenceOptions(listOf("onlyInCoupledResources", "literatureReferences"), DocStateFilter.LATEST)
        softOptions shouldBe BawIncomingReferenceOptions(
            docStateFilter = DocStateFilter.LATEST,
            onlyInCoupledResources = true,
            literatureReferences = true,
            addStructuralChildren = true,
        )

        val projOptions = bawProject.createIncomingReferenceOptions(emptyList(), DocStateFilter.ONLY_PUBLISHED)
        projOptions shouldBe BawIncomingReferenceOptions(
            docStateFilter = DocStateFilter.ONLY_PUBLISHED,
            onlyInCoupledResources = false,
            literatureReferences = false,
            addStructuralChildren = true,
        )
    }

    @Test
    fun `BAW doctypes generate correct SQL queries for onlyInCoupledResources`() {
        val bawGeoDataset = InGridGeoDatasetTypeBaw(jdbcTemplate)
        val doc = createTestDoc("baw-doc-1", 10)

        val query = bawGeoDataset.getIncomingReferenceQuery(
            doc,
            BawIncomingReferenceOptions(docStateFilter = DocStateFilter.LATEST, onlyInCoupledResources = true),
        )

        query shouldContain "data->'service'->'coupledResources' @> '[{\"uuid\": \"baw-doc-1\", \"isExternalRef\": false}]'"
        query shouldNotContain "data->'references'"
        query shouldNotContain "data->'parentIdentifier'"
        query shouldNotContain "document_wrapper.parent_id"
        query shouldNotContain "literatureReferences"
    }

    @Test
    fun `BAW doctypes generate correct SQL queries for literatureReferences`() {
        val bawPublication = BawPublication(jdbcTemplate)
        val doc = createTestDoc("baw-lit-uuid", 20)

        val query = bawPublication.getIncomingReferenceQuery(
            doc,
            BawIncomingReferenceOptions(docStateFilter = DocStateFilter.LATEST, literatureReferences = true),
        )

        query shouldContain "data->'literatureReferences' @> '[{\"uuid\": \"baw-lit-uuid\"}]'"
        query shouldNotContain "data->'service'->'coupledResources'"
        query shouldNotContain "data->'references'"
        query shouldNotContain "data->'parentIdentifier'"
        query shouldNotContain "document_wrapper.parent_id"
    }

    @Test
    fun `BAW doctypes generate correct default SQL queries with structural children`() {
        val bawGeoDataset = InGridGeoDatasetTypeBaw(jdbcTemplate)
        val doc = createTestDoc("baw-doc-2", 30)

        val query = bawGeoDataset.getIncomingReferenceQuery(
            doc,
            BawIncomingReferenceOptions(docStateFilter = DocStateFilter.LATEST, addStructuralChildren = true),
        )

        query shouldContain "data->'service'->'coupledResources' @> '[{\"uuid\": \"baw-doc-2\", \"isExternalRef\": false}]'"
        query shouldContain "data->'references' @> '[{\"uuidRef\": \"baw-doc-2\"}]'"
        query shouldContain "data->'parentIdentifier' @> (jsonb('\"baw-doc-2\"'))"
        query shouldContain "document_wrapper.parent_id = 30 AND document_wrapper.type != 'FOLDER'"
        query shouldNotContain "literatureReferences"
    }

    @Test
    fun `AddressType creates SimpleIncomingReferenceOptions`() {
        val addressType = AddressType(jdbcTemplate)
        val options = addressType.createIncomingReferenceOptions(listOf("anyOption"), DocStateFilter.LATEST)
        options shouldBe SimpleIncomingReferenceOptions(docStateFilter = DocStateFilter.LATEST)
    }
}
