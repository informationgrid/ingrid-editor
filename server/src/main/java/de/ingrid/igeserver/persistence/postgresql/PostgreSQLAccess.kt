package de.ingrid.igeserver.persistence.postgresql

import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.FindResults
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.IgeEntity
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import java.io.Closeable
import javax.persistence.EntityManager
import kotlin.reflect.KClass

@Service
class PostgreSQLAccess {
    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    /**
     * Id of the catalog that is acquired on the current thread
     */
    private val catalogId = ThreadLocal<Int?>()

    private val log = logger()

    fun acquireCatalog(name: String): Closeable {
        val catalog = getCatalog(name)
        return if (catalog != null) {
            catalogId.set(catalog.id)

            // start a transaction that will be committed when closed
            ClosableTransaction(transactionManager) { catalogId.set(null) }
        } else {
            throw PersistenceException.withReason("Catalog '$name' does not exist.")
        }
    }

    val catalogs: List<Catalog>
        get() {
            return findAll(Catalog::class)
        }

    fun <T : Any> findAll(@Param("klass") entity: KClass<T>): List<T> {
        val queryStr = "SELECT e FROM ${entity.simpleName} e"

        return entityManager
            .createQuery(queryStr, entity.java)
            .resultList
    }

    fun <T : Any> find(entity: KClass<T>, id: Any): T {
        return entityManager
            .find(entity.java, id)
    }

    fun <T : Any> findAll(entity: KClass<T>, query: List<QueryField>?, options: FindOptions): FindResults<T> {

        val where = mutableListOf<String>()
        query?.forEach {
            where.add("e.${it.field} = '${it.value}'")
        }

        val queryStr = """
            SELECT e FROM ${entity.simpleName} e 
            WHERE ${where.joinToString(" AND ")}
            """.trimIndent()
        val countQueryStr = """
            SELECT count(e) FROM ${entity.simpleName} e 
            WHERE ${where.joinToString(" AND ")}
            """.trimIndent()


        val typedQuery = entityManager.createQuery(queryStr, entity.java)
        val typedCountQuery = entityManager.createQuery(countQueryStr)

        val docs = typedQuery.resultList as List<T>
        val numDocs = typedCountQuery.singleResult as Long

        return FindResults(numDocs, docs)
    }

    fun <T : Any> findAll(entity: KClass<T>, hql: String): FindResults<T> {
        val resultList = entityManager.createQuery(hql, entity.java)
            .resultList as List<T>
        
        return FindResults(-1, resultList)
    }

    fun <T : IgeEntity> save(entity: T, identifier: String? = null): T {
        // get dataset from DB if exists
        val e = if (identifier != null) {
            prepareForSave(entity)
            val fromDB = entity.getByIdentifier(entityManager, identifier)
            entity.id = fromDB?.id
            entityManager.merge(entity)
        } else {
            prepareForSave(entity)
            entityManager.persist(entity)
            entity
        }

        return e
    }
    
    fun <T: IgeEntity> remove(entity: T) {
        entityManager.remove(entity)
    }

    private fun <T> prepareForSave(entity: T) {
        (entity as? EntityWithCatalog)?.catalog = currentCatalog()
//        entity.beforePersist(entityManager)
    }

    private fun currentCatalog(): Catalog? {
        val catId = catalogId.get()
        return if (catId != null)
            entityManager.getReference(Catalog::class.java, catId)
        else null
    }

    private fun getCatalog(name: String): Catalog? {
        // find the catalog by name
        return Catalog.getByIdentifier(entityManager, name)
    }

    fun getTransaction(): ClosableTransaction {
        return ClosableTransaction(transactionManager)
    }

}