package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M032_createACLEntries : MigrationBase("0.32") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val insertClass = """
        INSERT INTO acl_class VALUES (1, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'java.lang.Integer')
    """.trimIndent()
    
    private val insertSid = """
        INSERT INTO acl_sid VALUES (1, true, 'ige')
    """.trimIndent()
    
    private val insertRootSql = """
        INSERT INTO acl_object_identity
            (object_id_class, object_id_identity,
             parent_object, owner_sid, entries_inheriting)
            VALUES (1, :uuid, null, 1, true)
    """.trimIndent()

    private val insertSql = """
        INSERT INTO acl_object_identity
            (object_id_class, object_id_identity,
             parent_object, owner_sid, entries_inheriting)
            VALUES (1, :uuid, :parentId, 1, true)
    """.trimIndent()

    private val updateWrapperPath = """
        UPDATE document_wrapper SET path=CAST(:path as text[]) WHERE uuid=:uuid
    """.trimIndent()
    
    private val updateSequences = """
        ALTER SEQUENCE acl_sid_id_seq RESTART WITH 2;
    """.trimIndent()

    override fun exec() {}
    
    override fun postExec() {
        ClosableTransaction(transactionManager).use {

            entityManager.createNativeQuery(
                """
                truncate table acl_class cascade;
                truncate table acl_entry cascade ;
                truncate table acl_object_identity cascade ;
                truncate table acl_sid cascade ;
            """.trimIndent()
            ).executeUpdate()

            entityManager.createNativeQuery(insertClass).executeUpdate()
            entityManager.createNativeQuery(insertSid).executeUpdate()

            val parentIds =
                entityManager.createQuery("SELECT dw.id FROM DocumentWrapper dw where dw.parent is null").resultList

            parentIds.forEach { uuid ->
                entityManager
                    .createNativeQuery(insertRootSql)
                    .setParameter("uuid", uuid)
                    .executeUpdate()
                addChildren(uuid as String, mutableListOf())
            }

            entityManager
                .createNativeQuery(updateSequences)
                .executeUpdate()
        }
    }

    private fun addChildren(uuid: String, previousUuids: MutableList<String>) {

        previousUuids.add(uuid)
        val childrenIds = entityManager
            .createQuery("SELECT dw.id FROM DocumentWrapper dw where dw.parent is not null and dw.parent.id is '$uuid'")
            .resultList
        val parentDbId = entityManager
            .createNativeQuery("SELECT id FROM acl_object_identity where object_id_identity = '$uuid'")
            .resultList[0]

        childrenIds.forEach { childUuid ->
            entityManager
                .createNativeQuery(insertSql)
                .setParameter("uuid", childUuid)
                .setParameter("parentId", parentDbId)
                .executeUpdate()
            entityManager
                .createNativeQuery(updateWrapperPath)
                .setParameter("path", "{${previousUuids.joinToString()}}")
                .setParameter("uuid", childUuid)
                .executeUpdate()

            addChildren(childUuid as String, previousUuids.toMutableList())
        }

        // TODO: increase id generators for tables with inserted data

    }

}