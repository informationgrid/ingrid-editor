package de.ingrid.igeserver.profiles.mcloud.types

import de.ingrid.igeserver.persistence.model.EntityType
import org.springframework.stereotype.Component

@Component
class MCloudType : EntityType {
    override val className: String
        get() = "mCloudDoc"
    override val profiles: Array<String>?
        get() = listOf("mcloud").toTypedArray()
}