package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.configuration.acl.CustomPermission
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.GroupData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.GroupRepository
import de.ingrid.igeserver.repository.UserRepository
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
import java.util.*


@Service
class GroupService @Autowired constructor(
    private val groupRepo: GroupRepository,
    private val userRepo: UserRepository,
    private val catalogRepo: CatalogRepository,
    private val aclService: AclService
) {

    private val log = logger()

    @Transactional
    fun create(catalogId: String, group: Group): Group {
        group.catalog = catalogRepo.findByIdentifier(catalogId)
        group.data = group.data ?: GroupData()
        group.data?.creationDate = Date()
        group.data?.modificationDate = Date()

        updateAcl(group)

        return groupRepo.save(group)

        /*group.permissions?.documents?.forEach {
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
        group.data = oldGroup?.data ?: GroupData()
        group.data?.modificationDate = Date()

        updateAcl(group)

        return groupRepo.save(group)

    }

    private fun updateAcl(group: Group) {
        aclService as JdbcMutableAclService

        val docs = group.permissions?.documents ?: emptyList()
        val addresses = group.permissions?.addresses ?: emptyList()
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
            "writeTreeExceptParent" -> listOf(BasePermission.READ, CustomPermission.WRITE_ONLY_SUBTREE)
            "readTree" -> listOf(BasePermission.READ)
            else -> listOf(BasePermission.READ)
        }
    }

    fun remove(catalogId: String, id: Int) {

        groupRepo.deleteById(id)

    }
    
    fun getUsersOfGroup(id: Int) : List<UserInfo> {
        return userRepo.findByGroups_Id(id);
    }

}
