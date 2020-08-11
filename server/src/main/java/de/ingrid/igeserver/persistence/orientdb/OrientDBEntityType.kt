package de.ingrid.igeserver.persistence.orientdb

import com.orientechnologies.orient.core.db.ODatabaseSession
import de.ingrid.igeserver.persistence.model.EntityType
import kotlin.reflect.KClass

/**
 * All database classes must implement this interface.
 *
 * NOTE: All classes must use the @Component annotation to be discoverable by OrientDBDatabase.
 */
interface OrientDBEntityType : EntityType {

    /**
     * The implemented entity type.
     */
    val entityType: KClass<out EntityType>

    /**
     * Initialize a database with this entity type.
     */
    fun initialize(session: ODatabaseSession) {}
}