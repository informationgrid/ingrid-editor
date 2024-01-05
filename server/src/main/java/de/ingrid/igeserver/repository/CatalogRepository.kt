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
import org.springframework.data.jpa.repository.JpaRepository

interface CatalogRepository : JpaRepository<Catalog, Int> {
    // TODO: when caching then we might get a detached entity error if the cached value is used as a reference
    //       in another entity. In this case we should call merge-method of the entityManager.
//    @Cacheable(value = ["catalog"])
    fun findByIdentifier(identifier: String): Catalog

    fun existsByIdentifier(identifier: String): Boolean

    fun findAllByType(type: String): List<Catalog>
}