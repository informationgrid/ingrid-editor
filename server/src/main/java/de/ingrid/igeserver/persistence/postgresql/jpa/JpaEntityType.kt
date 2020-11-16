package de.ingrid.igeserver.persistence.postgresql.jpa

import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import kotlin.reflect.KClass

/**
 * All java persistence entity type classes must implement this interface.
 */
interface JpaEntityType {

    /**
     * The corresponding java persistence type.
     */
    val jpaType: KClass<out EntityBase>
}