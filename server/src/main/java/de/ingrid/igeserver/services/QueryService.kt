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
package de.ingrid.igeserver.services

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class QueryService(
    val query: QueryRepository,
    val catalog: CatalogRepository,
    val user: UserRepository,
    private val dateService: DateService
) {

    fun getQueriesForUser(userId: String, catalogId: String): List<Query> {

        val catRef = this.catalog.findByIdentifier(catalogId)
        return query.findAllByCatalog(catRef)
            .filter { it.global || it.user?.userId == userId }

    }

    fun saveQuery(userId: String?, catalogId: String, data: Query): Query {

        if (userId != null) {
            data.user = user.findByUserId(userId)
        }
        data.catalog = catalog.findByIdentifier(catalogId)
        data.modified = dateService.now()

        return query.save(data)
    }

    fun removeQueryForUser(id: Int) {

        query.deleteById(id)

    }

}