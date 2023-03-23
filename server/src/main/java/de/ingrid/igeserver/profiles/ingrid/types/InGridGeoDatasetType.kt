package de.ingrid.igeserver.profiles.ingrid.types

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class InGridGeoDatasetType @Autowired constructor() : InGridBaseType() {
    override val className = "InGridGeoDataset"
    override val jsonSchema = "/ingrid/schemes/geo-dataset.schema.json"
}
