package de.ingrid.igeserver.exports

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document

interface IgeExporter {
    val typeInfo: ExportTypeInfo

    fun run(jsonData: Document): Any
    fun toString(exportedObject: Any): String
}