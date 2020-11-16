package de.ingrid.igeserver.persistence.postgresql.jpa.model

import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData

/**
 * Interface for entities that store a JSON object in one database column that is possibly unwrapped in the entity's JSON
 * representation. Unwrapping is controlled by the 'unwrapData' property.
 *
 * For example the following database record
 *
 * id:1, type:'AddressDoc' data:'{"company":"LWL-Schulverwaltung Münster", "lastName":"Mustermann", "firstName":"Petra"}'
 *
 * will be - if unwrapping is active - represented in JSON as
 *
 * {"id":1, "type":"AddressDoc", "company":"LWL-Schulverwaltung Münster", "lastName":"Mustermann", "firstName":"Petra"}
 */
interface EntityWithEmbeddedData<T: EmbeddedData> {

    /**
     * The JSON data property
     * NOTE this value is only needed when creating a string from an entity instance
     */
    var data: T?

    /**
     * The type of embedded data used to map to concrete EmbeddedData implementations while deserialization
     * NOTE this value is only needed when creating an entity instance from a string
     */
    var type: String?

    /**
     * The value of the JSON data property as map to be used when deserializing a string into an entity instance
     * NOTE this value is only needed when creating an entity instance from a string
     */
    var dataFields: Map<String, Any>?

    /**
     * Indicates if embedded data should be unwrapped in the JSON representation
     * NOTE this value is only needed when creating a string from an entity instance
     */
    var unwrapData: Boolean
}