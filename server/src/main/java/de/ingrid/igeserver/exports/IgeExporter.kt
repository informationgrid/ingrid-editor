package de.ingrid.igeserver.exports

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document

interface IgeExporter {
    val typeInfo: ExportTypeInfo

    fun run(doc: Document, catalogId: String): Any
    fun toString(exportedObject: Any): String
}