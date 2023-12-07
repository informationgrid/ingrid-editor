package de.ingrid.igeserver.profiles.ingrid_up_sh.exporter

import de.ingrid.igeserver.profiles.ingrid.exporter.IngridProfileTransformer
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class UPSHProfileTransformer : IngridProfileTransformer {

    override fun get(docType: String): KClass<*>? {
        return when(docType) {
            "InGridGeoDataset" -> GeodatasetTransformerUPSH::class
            else -> null
        } 
    }

}