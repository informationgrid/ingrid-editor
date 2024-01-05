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

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface GroupRepository : JpaRepository<Group, Int> {
    
    fun findAllByCatalog_Identifier(catalog_identifier: String, sort: Sort = Sort.by(Sort.Direction.ASC, "name")): List<Group>
    
    fun findAllByCatalog_IdentifierAndId(catalog_identifier: String, id: Int): Group

    /**
     * This function needs to be overridden, otherwise a group is not deleted if the
     * currently logged in user belongs to this group.
     */
    @Modifying
    @Query("delete from Group g where g.id = ?1")
    override fun deleteById(id: Int)
    
}