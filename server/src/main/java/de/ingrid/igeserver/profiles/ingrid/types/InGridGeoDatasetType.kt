package de.ingrid.igeserver.profiles.ingrid.types

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class InGridGeoDatasetType @Autowired constructor() : InGridBaseType() {
    override val className = "InGridGeoDataset"
    override val jsonSchema = "/ingrid/schemes/geo-dataset.schema.json"

    override fun onCreate(doc: Document) {
        super.onCreate(doc)
        
        // identifier must be empty, especially during copy operation (#5234)
        doc.data.put("identifier", "")
    }
}
