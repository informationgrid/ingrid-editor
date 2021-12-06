package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import javax.persistence.EntityManager

@Service
class M036_MigrateToDBID : MigrationBase("0.36") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sqlUpdateAclClass = """
        UPDATE acl_class SET class_id_type='java.lang.Integer' WHERE id=1;
    """.trimIndent()

    private val sqlAllObjectIdentities = """
        SELECT acl.id, acl.object_id_identity, dw.id as WrapperId FROM acl_object_identity acl, document_wrapper dw WHERE acl.object_id_identity = dw.uuid;
    """.trimIndent()

    private val sqlUpdateObjectIdentity = """
        UPDATE acl_object_identity SET object_id_identity=:newObjId WHERE id=:id ;
    """.trimIndent()

    private val sqlRootDocumentWrapper = """
        SELECT dw.id FROM DocumentWrapper dw where dw.parent is null
    """.trimIndent()
/*
    private val sqlUpdateWrapperPath = """
        UPDATE document_wrapper SET path=:newPath WHERE id=:id ;
    """.trimIndent()*/

    private val updateWrapperPath = """
        UPDATE document_wrapper SET path=CAST(:path as int[]) WHERE id=:id
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {

            try {
                migrateAclClass()
                migrateAclObjectIdentities()
                migratePaths()
            } catch (e: Exception) {
                it.markForRollback()
                throw e
            }

        }
    }

    private fun migratePaths() {
        val docWrappersRoot = entityManager.createQuery(sqlRootDocumentWrapper).resultList

        docWrappersRoot.forEach { wrapperId ->
            addChildren(wrapperId as Int, mutableListOf())
        }
    }

    private fun addChildren(id: Int, previousUuids: MutableList<Int>) {

        previousUuids.add(id)
        val childrenIds = entityManager
            .createQuery("SELECT dw.dbId FROM DocumentWrapper dw where dw.parent is not null and dw.parent.dbId is $id")
            .resultList

        childrenIds.forEach { childId ->
            entityManager
                .createNativeQuery(updateWrapperPath)
                .setParameter("path", "{${previousUuids.joinToString()}}")
                .setParameter("id", childId)
                .executeUpdate()

            addChildren(childId as Int, previousUuids.toMutableList())
        }
    }

    private fun migrateAclObjectIdentities() {

        val objIdentities = entityManager.createNativeQuery(sqlAllObjectIdentities).resultList

        objIdentities.forEach { objIdentity ->
            objIdentity as Array<*>
            entityManager.createNativeQuery(sqlUpdateObjectIdentity)
                .setParameter("newObjId", objIdentity[2])
                .setParameter("id", objIdentity[0])
                .executeUpdate()
        }
    }

    private fun migrateAclClass() {
        entityManager.createNativeQuery(sqlUpdateAclClass).executeUpdate()
    }

}
