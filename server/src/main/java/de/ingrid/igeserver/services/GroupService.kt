package de.ingrid.igeserver.services

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.repository.GroupRepository
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service

@Service
class GroupService @Autowired constructor(private val groupRepo: GroupRepository) {

    private val log = logger()

    fun create(catalogId: String, group: Group) {
        group.identifier = getUniqueGroupId(catalogId, group)

        groupRepo.save(group)
    }

    private fun getUniqueGroupId(catalogId: String, group: Group): String {

        var id = group.name
            ?.toLowerCase()
            ?.filter { !it.isWhitespace() }!!

        val origId = id
        var counter = 1
        while (exists(catalogId, id)) {
            id = "${origId}_${counter++}"
        }

        return id

    }

    fun getAll(catalogId: String): List<Group> {

        return groupRepo.findAllByCatalog_Identifier(catalogId, Sort.by(Sort.Direction.ASC, "name"))

    }

    fun exists(catalogId: String, id: String): Boolean {
        return get(catalogId, id) != null
    }

    fun get(catalogId: String, id: String): Group? {

        return groupRepo.findAllByCatalog_IdentifierAndIdentifier(catalogId, id)

    }

    fun update(catalogId: String, id: String, group: Group): Group {

        val oldGroup = get(catalogId, id)
        group.id = oldGroup?.id
        return groupRepo.save(group)

    }

    fun remove(catalogId: String, id: String) {

        groupRepo.deleteByIdentifier(id)

    }

}
