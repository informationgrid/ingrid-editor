package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.mdek.upload.Config
import org.jetbrains.kotlin.util.suffixIfNot

class GeodataserviceModelTransformer constructor(
    model: IngridModel,
    catalogIdentifier: String,
    codelistTransformer: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
) : IngridModelTransformer(
    model, catalogIdentifier, codelistTransformer, config, catalogService
) {

    override val hierarchyLevel = "service"
    override val hierarchyLevelName = "service"
    override val mdStandardName = "ISO19119"
    override val mdStandardVersion = "2005/PDAM 1"
    override val identificationType = "srv:SV_ServiceIdentification"
    override val description: String
        get() {
            var description = model.data.description ?: ""

            val resolution = model.data.service?.resolution ?: emptyList()
            val denominator = resolution.joinToString(", ") { "1:" + it.denominator }
            val distanceMeter = resolution.map { it.distanceMeter }.joinToString("m, ")
            val distanceDPI = resolution.map { it.distanceDPI }.joinToString(", ")

            if (denominator.isNotEmpty()) description += " Maßstab: $denominator;"
            if (distanceMeter.isNotEmpty()) description += " Bodenauflösung: ${distanceMeter}m;"
            if (distanceDPI.isNotEmpty()) description += " Scanauflösung (DPI): $distanceDPI;"

            if (model.data.service?.systemEnvironment != null) description += " Systemumgebung: ${model.data.service.systemEnvironment};"
            if (model.data.service?.explanation != null) description += " Erläuterung zum Fachbezug: ${model.data.service.explanation};"


            return description.removeSuffix(";")
        }

    val history = data.service?.implementationHistory
    val conformanceResult = model.data.conformanceResult ?: emptyList()
    val hasAccessConstraint = model.data.service?.hasAccessConstraints ?: false


    init {
        if (model.data.identifier != null) {
            this.citationURL =
                (if (catalog.settings?.config?.namespace.isNullOrEmpty()) "https://registry.gdi-de.org/id/$catalogIdentifier" else catalog.settings?.config?.namespace!!).suffixIfNot(
                    "/"
                ) + model.data.identifier
        }
    }


}

