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
package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DOCUMENT_STATE
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.security.access.prepost.PreAuthorize

interface DocumentRepository : JpaRepository<Document, Int> {

    fun getByCatalogAndUuidAndIsLatestIsTrue(catalog: Catalog, uuid: String): Document

    fun findAllByCatalogAndIsLatestIsTrueAndUuidIn(catalog: Catalog, uuid: List<String>): List<Document>

    // caution! no deleted, latest checks. used for post-migration
    fun  findAllByCatalog_Identifier(catalog_identifier: String): List<Document>

    fun countByCatalog_IdentifierAndStateAndIsLatestIsTrue(catalog_identifier: String, state: DOCUMENT_STATE): Long

    /**
     * @deprecated
     * There is no check if the document is already deleted!
     */
    fun getByCatalog_IdentifierAndUuidAndState(
        catalog_identifier: String,
        uuid: String,
        state: DOCUMENT_STATE
    ): Document

    @Modifying
    @PreAuthorize("hasPermission(#uuid, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'WRITE')")
    fun deleteAllByCatalog_IdentifierAndUuid(catalog_identifier: String, uuid: String)

    @PreAuthorize("#document.id == null || hasPermission(#document.wrapperId, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'WRITE')")
    fun save(@Param("document") document: Document): Document

    /**
     * Replace matching reference text from all draft and published versions that:
     *   - are not deleted
     *   - belong to the catalog
     *   - belong to category 'data'
     *   - contain the address reference to be replaced in the jsonb as text content
     * The selector should be strong enough. If the string "ref": "<UUID>" appears somewhere else
     * in the document, then it'll be also replaced!
     * This function is only allowed for catalog administrators and above, since documents might be changed
     * an author does not have access to.
     */
    @Modifying
    @PreAuthorize("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin')")
    @Query(
        value = """
        UPDATE document
        SET data = (replace(data\:\:text, :source, :target)\:\:jsonb)
        WHERE id IN :refIds
        """, nativeQuery = true
    )
    fun replaceReference(
        @Param("source") source: String,
        @Param("target") target: String,
        @Param("refIds") refIds: List<Int>
    )

    @Modifying
    @Query(value = """
        SELECT doc.id as docId
                     FROM catalog,
                          document_wrapper dw, document doc
                     WHERE dw.catalog_id = catalog.id AND doc.catalog_id = catalog.id AND catalog.identifier = :catalogIdent AND dw.deleted = 0
                       AND dw.uuid = doc.uuid
                       AND (doc.state = 'PUBLISHED' OR doc.state = 'DRAFT' OR doc.state = 'DRAFT_AND_PUBLISHED' OR doc.state = 'PENDING')
                       AND dw.category = 'data'
                       AND (replace(doc.data\:\:text, ':', '\\:') ilike %:source%)
    """, nativeQuery = true)
    fun getDocIdsWithReferenceTo(@Param("catalogIdent") catalogId: String, @Param("source") source: String): List<Int>

    @Query("""
        SELECT doc.uuid FROM document_wrapper dw, document doc, catalog cat WHERE dw.uuid = doc.uuid AND dw.deleted = 0 AND dw.catalog_id = cat.id AND doc.catalog_id = cat.id AND cat.identifier = :catalogIdentifier AND doc.data->>'organization' = :name
    """, nativeQuery = true)
    fun findAddressByOrganisationName(@Param("catalogIdentifier") catalogIdentifier: String, @Param("name") name: String): List<String>

    @Query("""
        SELECT doc.uuid FROM document_wrapper dw, document doc, catalog cat WHERE dw.uuid = doc.uuid AND dw.deleted = 0 AND dw.catalog_id = cat.id AND doc.catalog_id = cat.id AND cat.identifier = :catalogIdentifier AND doc.data->>'firstName' = :firstname AND doc.data->>'lastName' = :lastname
    """, nativeQuery = true)
    fun findAddressByPerson(@Param("catalogIdentifier") catalogIdentifier: String, @Param("firstname") firstname: String?, @Param("lastname") lastname: String?): List<String>
}
