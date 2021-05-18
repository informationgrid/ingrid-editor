package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import javax.persistence.EntityManager

@Service
class M030_createACLEntries : MigrationBase("0.30") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
        INSERT INTO acl_class (id, class, class_id_type) VALUES (1, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'java.lang.String');
        """.trimIndent()
    private val insertSql = """
        INSERT INTO acl_object_identity
            (object_id_class, object_id_identity,
             parent_object, owner_sid, entries_inheriting)
            VALUES
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            // entityManager.createNativeQuery(sql).executeUpdate()
            val parentIds = entityManager.createQuery("SELECT dw.id FROM DocumentWrapper dw where dw.parent is null").resultList
            
            parentIds.forEach { uuid ->
                entityManager
                    .createNativeQuery("$insertSql (1, '$uuid', null, 1, true)")
                    .executeUpdate()
                addChildren(uuid as String)
            }
        }
    }

    private fun addChildren(uuid: String) {

        val childrenIds = entityManager.createQuery("SELECT dw.id FROM DocumentWrapper dw where dw.parent is not null and dw.parent.id is '$uuid'").resultList
        val parentDbId = entityManager.createNativeQuery("SELECT id FROM acl_object_identity where object_id_identity = '$uuid'").resultList.get(0)

        childrenIds.forEach { childUuid ->
            entityManager
                .createNativeQuery("$insertSql (1, '$childUuid', $parentDbId, 1, true)")
                .executeUpdate()
            addChildren(childUuid as String)
        }
        
        
    }

}