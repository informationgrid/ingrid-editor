package de.ingrid.igeserver.profiles.ingrid.exporter

import kotlin.reflect.KClass

interface IngridProfileTransformer {
    fun get(docType: String): KClass<*>?
}
