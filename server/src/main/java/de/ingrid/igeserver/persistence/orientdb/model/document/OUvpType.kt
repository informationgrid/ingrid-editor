package de.ingrid.igeserver.persistence.orientdb.model.document

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.UvpType
import de.ingrid.igeserver.persistence.model.document.impl.BaseUvpType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDocumentEntityType
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class OUvpType : BaseUvpType(), OrientDBDocumentEntityType {

    override val entityType: KClass<out EntityType>
        get() = UvpType::class
}