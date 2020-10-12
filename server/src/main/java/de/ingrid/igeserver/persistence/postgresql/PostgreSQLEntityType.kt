package de.ingrid.igeserver.persistence.postgresql

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.JpaEntityType
import kotlin.reflect.KClass

/**
 * All database classes must implement this interface.
 *
 * NOTE: All classes must use the @Component annotation to be discoverable by PostgreSQLDatabase.
 */
interface PostgreSQLEntityType : JpaEntityType {

    /**
     * The implemented entity type.
     */
    val entityType: KClass<out EntityType>
}