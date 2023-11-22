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