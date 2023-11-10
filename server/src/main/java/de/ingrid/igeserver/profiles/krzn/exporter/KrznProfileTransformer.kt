package de.ingrid.igeserver.profiles.krzn.exporter

import de.ingrid.igeserver.profiles.ingrid.exporter.IngridProfileTransformer
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
@Profile("krzn")
class KrznProfileTransformer : IngridProfileTransformer {

    override fun get(): KClass<*>? {
        return IngridModelTransformerKrzn::class
    }

}