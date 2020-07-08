package de.ingrid.igeserver.persistence.orientdb

import com.orientechnologies.orient.core.db.ODatabaseSession
import de.ingrid.igeserver.persistence.model.EntityType
import kotlin.reflect.KClass

/**
 * All database classes used for *catalog content* must implement this interface.
 *
 * NOTE: All classes must use the @Component annotation to be discoverable by OrientDBDatabase.
 */
interface OrientDBDocumentEntityType : OrientDBEntityType {
}