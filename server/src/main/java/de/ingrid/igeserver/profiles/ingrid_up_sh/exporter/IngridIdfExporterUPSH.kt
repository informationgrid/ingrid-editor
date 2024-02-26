package de.ingrid.igeserver.profiles.ingrid_up_sh.exporter

import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class IngridIdfExporterUPSH(
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService
) : IngridIDFExporter(codelistHandler, config, catalogService, documentService) {

    override fun getModelTransormerClasses(): Map<String, KClass<out Any>> {
        return super.getModelTransormerClasses().toMutableMap().apply {
            put("InGridGeoDataset", GeodatasetTransformerUPSH::class)
        }
    }
}
