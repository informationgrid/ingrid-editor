package de.ingrid.igeserver.services

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.GroupRepository
import de.ingrid.igeserver.repository.UserRepository
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service

@Service
class GroupService @Autowired constructor(
    private val groupRepo: GroupRepository,
    private val catalogRepo: CatalogRepository,
    private val userRepo: UserRepository
) {

    private val log = logger()

    fun create(catalogId: String, group: Group) {
        group.catalog = catalogRepo.findByIdentifier(catalogId)
        groupRepo.save(group)
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
        return groupRepo.save(group)

    }

    fun remove(catalogId: String, id: Int) {

        groupRepo.deleteById(id)

    }

}
