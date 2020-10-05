package de.ingrid.igeserver.persistence.orientdb.model.document

import de.ingrid.igeserver.persistence.model.document.AddressType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.impl.BaseAddressType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDocumentEntityType
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class OAddressType : BaseAddressType(), OrientDBDocumentEntityType {

    override val entityType: KClass<out EntityType>
        get() = AddressType::class
}