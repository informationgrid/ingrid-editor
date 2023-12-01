package de.ingrid.igeserver.profiles.ingrid_krzn.exporter

import de.ingrid.igeserver.profiles.ingrid.exporter.IngridProfileTransformer
import de.ingrid.igeserver.profiles.ingrid_up_sh.exporter.GeodatasetTransformerUPSH
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class KrznProfileTransformer : IngridProfileTransformer {

    override fun get(docType: String): KClass<*>? {
        return when(docType) {
            "InGridGeoDataset" -> GeodatasetTransformerUPSH::class
            else -> null
        } 
    }

}