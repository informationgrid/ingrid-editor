package de.ingrid.igeserver.persistence.postgresql.jpa

import java.io.Serializable

/**
 * EmbeddedData implementations are used to define the JSON structure to be saved in a PostgreSQL jsonb column.
 *
 * NOTE: All classes must use the @Component annotation to be discoverable by EmbeddedDataType.
 */
interface EmbeddedData : Serializable {

    /**
     * The value to be stored in the "type" column (e.g. AddressDoc) of records containing this embedded data type.
     */
    val typeColumnValue: String
}