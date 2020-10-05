package de.ingrid.igeserver.persistence.orientdb.model.document

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.FolderType
import de.ingrid.igeserver.persistence.model.document.impl.BaseFolderType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDocumentEntityType
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class OFolderType : BaseFolderType(), OrientDBDocumentEntityType {

    override val entityType: KClass<out EntityType>
        get() = FolderType::class
}