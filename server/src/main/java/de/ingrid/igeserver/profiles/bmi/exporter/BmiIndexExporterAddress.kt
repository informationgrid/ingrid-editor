package de.ingrid.igeserver.profiles.bmi.exporter

import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.http.MediaType

/**
 * ATTENTION: Addresses are not exported. This class can be removed
 */
//@Service
class BmiIndexExporterAddress : IgeExporter {

    override val typeInfo: ExportTypeInfo
        get() {
            return ExportTypeInfo(
                DocumentCategory.ADDRESS,
                "index",
                "BMI Adressen",
                "Export der Daten für die weitere Verwendung im Liferay Portal und Exporter.",
                MediaType.APPLICATION_JSON_VALUE,
                "json",
                listOf("index")
            )
        }

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        // do not export addresses
        return "{}"
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }

}
