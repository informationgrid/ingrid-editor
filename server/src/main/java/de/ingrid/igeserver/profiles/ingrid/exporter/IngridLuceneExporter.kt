package de.ingrid.igeserver.profiles.ingrid.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.FolderModelTransformer
import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.FolderModel
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import org.unbescape.json.JsonEscape

@Service
class IngridLuceneExporter(
    val codelistHandler: CodelistHandler,
    val config: Config,
    val catalogService: CatalogService,
    @Lazy val documentService: DocumentService
) {
    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    var profileTransformer: IngridProfileTransformer? = null


    fun run(doc: Document, catalogId: String): Any {
        val output: TemplateOutput = JsonStringOutput()
        handleFoldersWithoutPublishedChildrens(doc)
        val catalog = catalogService.getCatalogById(catalogId)
        val templateData = getTemplateForDoctype(doc, catalog)
        templateEngine.render(templateData.first, templateData.second, output)
        return output.toString()
    }

    private fun handleFoldersWithoutPublishedChildrens(doc: Document) {
        if (doc.type == "FOLDER") {
            val children = documentService.docWrapperRepo.findByParentIdAndPublished(doc.wrapperId!!)
            if (children.isEmpty()) throw IndexException.folderWithNoPublishedDocs(doc.uuid)
        }
    }

    private fun getTemplateForDoctype(doc: Document, catalog: Catalog): Pair<String, Map<String, Any>> {
        return when (doc.type) {
            "InGridSpecialisedTask" -> Pair("ingrid/template-lucene.jte", getMapper(IngridDocType.DOCUMENT, doc, catalog))
            "InGridGeoDataset" -> Pair("ingrid/template-lucene.jte", getMapper(IngridDocType.DOCUMENT, doc, catalog))
            "InGridLiterature" -> Pair("ingrid/template-lucene.jte", getMapper(IngridDocType.DOCUMENT, doc, catalog))
            "InGridGeoService" -> Pair("ingrid/template-lucene.jte", getMapper(IngridDocType.DOCUMENT, doc, catalog))
            "InGridProject" -> Pair("ingrid/template-lucene.jte", getMapper(IngridDocType.DOCUMENT, doc, catalog))
            "InGridDataCollection" -> Pair("ingrid/template-lucene.jte", getMapper(IngridDocType.DOCUMENT, doc, catalog))
            "InGridInformationSystem" -> Pair("ingrid/template-lucene.jte", getMapper(IngridDocType.DOCUMENT, doc, catalog))
            "InGridOrganisationDoc" -> Pair("ingrid/template-lucene-address.jte", getMapper(IngridDocType.ADDRESS, doc, catalog))
            "InGridPersonDoc" -> Pair("ingrid/template-lucene-address.jte", getMapper(IngridDocType.ADDRESS, doc, catalog))
            "FOLDER" -> Pair("ingrid/template-lucene-folder.jte", getMapper(IngridDocType.FOLDER, doc, catalog))
            else -> {
                throw ServerException.withReason("Cannot get template for type: ${doc.type}")
            }
        }
    }

    fun getMapper(type: IngridDocType, doc: Document, catalog: Catalog): Map<String, Any> {

        val mapper = ObjectMapper().registerKotlinModule()
        val codelistTransformer = CodelistTransformer(codelistHandler, catalog.identifier)

        val otherTransformer = profileTransformer?.get(doc.type)
        val transformer: Any = when (type) {
            IngridDocType.ADDRESS -> {
                if (otherTransformer != null) {
                    otherTransformer.constructors.first().call(mapper.convertValue(doc, AddressModel::class.java), catalog.identifier, codelistTransformer, doc)
                } else {
                    AddressModelTransformer(
                        mapper.convertValue(doc, AddressModel::class.java),
                        catalog.identifier,
                        codelistTransformer
                    )
                }
            }
            IngridDocType.DOCUMENT -> {
                if (otherTransformer != null) {
                    otherTransformer.constructors.first().call(mapper.convertValue(doc, IngridModel::class.java), catalog.identifier, codelistTransformer, config, catalogService, TransformerCache(), doc)
                } else {
                    IngridModelTransformer(
                        mapper.convertValue(doc, IngridModel::class.java),
                        catalog.identifier,
                        codelistTransformer,
                        config,
                        catalogService, TransformerCache()
                    )
                }
            }
            IngridDocType.FOLDER -> {
                FolderModelTransformer(
                    mapper.convertValue(doc, FolderModel::class.java),
                    catalog.identifier,
                    codelistTransformer
                )
            }
        }
        
        return mapOf(
            "map" to mapOf(
                "model" to transformer,
                "catalog" to catalog,
                "partner" to mapCodelistValue("110", catalog.settings?.config?.partner),
                "provider" to mapCodelistValue("111", catalog.settings?.config?.provider)
            )
        )

    }

    private fun mapCodelistValue(codelistId: String, partner: String?): String {
        return partner?.let { codelistHandler.getCodelistValue(codelistId, it, "ident") } ?: ""
    }

    class JsonStringOutput : StringOutput() {
        override fun writeUserContent(value: String?) {
            if (value == null) return
            super.writeUserContent(
                JsonEscape.escapeJson(value)
            )
        }
    }
    
    enum class IngridDocType {
        ADDRESS, DOCUMENT, FOLDER
    }
}
