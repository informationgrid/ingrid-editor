package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.GroupRepository
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Sort
import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.domain.GrantedAuthoritySid
import org.springframework.security.acls.domain.ObjectIdentityImpl
import org.springframework.security.acls.jdbc.JdbcMutableAclService
import org.springframework.security.acls.model.AclService
import org.springframework.security.acls.model.MutableAcl
import org.springframework.security.acls.model.Permission
import org.springframework.security.acls.model.Sid
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional


@Service
class GroupService @Autowired constructor(
    private val groupRepo: GroupRepository,
    private val catalogRepo: CatalogRepository,
    private val aclService: AclService
) {

    private val log = logger()

    @Transactional
    fun create(catalogId: String, group: Group) {
        group.catalog = catalogRepo.findByIdentifier(catalogId)

        updateAcl(group)

        groupRepo.save(group)

        /*group.data?.documents?.forEach {
            val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, it.get("uuid").asText())
            val acl = aclService.createAcl(objIdentity)
            aclService.updateAcl(acl)
        }*/
    }

    fun getAll(catalogId: String): List<Group> {

        return groupRepo.findAllByCatalog_Identifier(catalogId, Sort.by(Sort.Direction.ASC, "name"))

    }

    fun exists(catalogId: String, id: Int): Boolean {
        return get(catalogId, id) != null
    }

    fun get(catalogId: String, id: Int): Group? {

        return groupRepo.findAllByCatalog_IdentifierAndId(catalogId, id)

    }

    @Transactional
    fun update(catalogId: String, id: Int, group: Group): Group {

        val oldGroup = get(catalogId, id)
        group.apply {
            this.id = oldGroup?.id
            catalog = oldGroup?.catalog
        }

        updateAcl(group)

        return groupRepo.save(group)

    }

    private fun updateAcl(group: Group) {
        aclService as JdbcMutableAclService

        val docs = group.data?.documents ?: emptyList()
        val addresses = group.data?.addresses ?: emptyList()
        (docs + addresses).forEach {
            val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, it.get("uuid").asText())
            val acl: MutableAcl = try {
                aclService.readAclById(objIdentity) as MutableAcl
            } catch (ex: org.springframework.security.acls.model.NotFoundException) {
                aclService.createAcl(objIdentity)
            }

            val sid = GrantedAuthoritySid("GROUP_${group.name}")

            addACEs(acl, it, sid)
            aclService.updateAcl(acl)
        }
    }

    private fun addACEs(acl: MutableAcl, docPermission: JsonNode, sid: GrantedAuthoritySid) {
        // write complete new acl entries for this object with this sid
        deleteAce(sid, acl)        

        determinePermission(docPermission)
            .forEach {
                acl.insertAce(acl.entries.size, it, sid, true)
            }
    }

    private fun deleteAce(sid: Sid, acl: MutableAcl) {
        val nrEntries = acl.entries.size
        var updated = false
        for (i in nrEntries - 1 downTo 0) {
            val accessControlEntry = acl.entries[i]
            if (accessControlEntry.sid == sid) {
                acl.deleteAce(i)
                updated = true
            }
        }
        if (updated) {
            (aclService as JdbcMutableAclService).updateAcl(acl)
        }
    }

    private fun determinePermission(docPermission: JsonNode): List<Permission> {
        return when (docPermission.get("permission").asText()) {
            "writeTree" -> listOf(BasePermission.READ, BasePermission.WRITE)
            // TODO Create logic for only read permission on parentnode and read + write on all descendants
            "writeTreeExceptParent" -> listOf(BasePermission.READ, BasePermission.WRITE)
            "readTree" -> listOf(BasePermission.READ)
            else -> listOf(BasePermission.READ)
        }
    }

    fun remove(catalogId: String, id: Int) {

        groupRepo.deleteById(id)

    }

}
