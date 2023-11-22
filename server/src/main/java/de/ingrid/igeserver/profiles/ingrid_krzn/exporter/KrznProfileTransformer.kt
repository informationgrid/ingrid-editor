package de.ingrid.igeserver.profiles.ingrid_krzn.exporter

import de.ingrid.igeserver.profiles.ingrid.exporter.IngridProfileTransformer
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class KrznProfileTransformer : IngridProfileTransformer {

    override fun get(docType: String): KClass<*>? {
        return when(docType) {
            "InGridGeoDataset" -> GeodatasetTransformerKrzn::class
            "InGridInformationSystem" -> InformationSystemModelTransformerKrzn::class
            else -> null
        } 
    }

}