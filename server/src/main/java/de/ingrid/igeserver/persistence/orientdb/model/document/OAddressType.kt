package de.ingrid.igeserver.persistence.orientdb.model.document

import de.ingrid.igeserver.persistence.model.document.AddressType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDocumentEntityType
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component()
class OAddressType : OrientDBDocumentEntityType {

    companion object {
        private const val CATEGORY = "address"
        private const val TYPE = "AddressDoc"
        private val PROFILES = arrayOf<String>()
    }

    override val category: String
        get() = CATEGORY

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE

    override val entityType: KClass<out EntityType>
        get() = AddressType::class
}