package de.ingrid.igeserver.profiles.ingrid.types

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.InitiatorAction
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class InGridGeoDatasetType @Autowired constructor() : InGridBaseType() {
    override val className = "InGridGeoDataset"
    override val jsonSchema = "/ingrid/schemes/geo-dataset.schema.json"

    override fun onCreate(doc: Document, initiator: InitiatorAction) {
        super.onCreate(doc, initiator)
        
        // identifier must be empty, especially during copy operation (#5234)
        if (initiator == InitiatorAction.COPY) {
            doc.data.put("identifier", "")
        }
    }
}
