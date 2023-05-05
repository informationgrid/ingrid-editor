package de.ingrid.igeserver.migrations.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import jakarta.persistence.EntityManager
import jakarta.persistence.NoResultException
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M037_MigrateToDBID : MigrationBase("0.37") {

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
                migratePermissions()
            } catch (e: Exception) {
                it.markForRollback()
                throw e
            }

        }
    }

    private fun migratePermissions() {

        @Suppress("UNCHECKED_CAST") val groups: List<Group> = entityManager.createQuery("SELECT g FROM Group g").resultList as List<Group>
        groups.forEach { group ->
            // val catalogIdentifier = group.catalog?.identifier
            val docPermissionChanges = migratePermissionFor(group.permissions?.documents)
            val addressPermissionChanges = migratePermissionFor(group.permissions?.addresses)
            if (docPermissionChanges || addressPermissionChanges) {
                entityManager.persist(group)
            }
        }

    }

    private fun migratePermissionFor(permissions: List<JsonNode>?): Boolean {
        if (permissions == null) return false

        permissions.forEach { permission ->
            permission as ObjectNode
            val uuid = permission.get("uuid").asText()


            try {
                val id = entityManager.createQuery("SELECT dw.id FROM DocumentWrapper dw WHERE dw.uuid = :uuid")
                    .setParameter("uuid", uuid)
                    .singleResult as Int

                permission.put("id", id)
                permission.remove("uuid")
            } catch (e: NoResultException) {
                // document does not exist to permission and can be ignored
            }
        }

        return permissions.isNotEmpty()
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
            .createQuery("SELECT dw.id FROM DocumentWrapper dw where dw.parent is not null and dw.parent.id is $id")
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

        removeInvalidACLs()

        val objIdentities = entityManager.createNativeQuery(sqlAllObjectIdentities).resultList

        objIdentities.forEach { objIdentity ->
            objIdentity as Array<*>
            entityManager.createNativeQuery(sqlUpdateObjectIdentity)
                .setParameter("newObjId", objIdentity[2])
                .setParameter("id", objIdentity[0])
                .executeUpdate()
        }
    }

    private fun removeInvalidACLs() {

        val numRemoved = entityManager
            .createNativeQuery("DELETE FROM acl_object_identity WHERE id IN (SELECT acl.id FROM acl_object_identity acl LEFT OUTER JOIN document_wrapper dw ON acl.object_id_identity = dw.uuid WHERE dw.id IS NULL)")
            .executeUpdate()

        log.info("Removed $numRemoved rows from acl_object_identity, since they were not connected to a document anymore")

    }

    private fun migrateAclClass() {
        entityManager.createNativeQuery(sqlUpdateAclClass).executeUpdate()
    }

}
