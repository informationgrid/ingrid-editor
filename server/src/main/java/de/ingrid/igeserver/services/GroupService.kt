package de.ingrid.igeserver.services

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.GroupRepository
import de.ingrid.igeserver.repository.UserRepository
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Sort
import org.springframework.security.acls.domain.ObjectIdentityImpl
import org.springframework.security.acls.jdbc.JdbcMutableAclService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class GroupService @Autowired constructor(
    private val groupRepo: GroupRepository,
    private val catalogRepo: CatalogRepository,
    private val aclService: JdbcMutableAclService,
    private val userRepo: UserRepository
) {

    private val log = logger()

    @Transactional
    fun create(catalogId: String, group: Group) {
        group.catalog = catalogRepo.findByIdentifier(catalogId)
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
        group.data?.documents?.forEach {
//            val objectIdentity = ObjectIdentityImpl(DocumentWrapper::class.qualifiedName, it.get("uuid").asText())
//            val acl = aclService.readAclById(objectIdentity)
            // acl.entries[0].

        }
    }

    private fun createAcl(group: Group) {

    }

    fun remove(catalogId: String, id: Int) {

        groupRepo.deleteById(id)

    }

}
