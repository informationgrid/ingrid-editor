/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.profiles.uvp.importer.dcatapeia

import com.bedatadriven.jackson.datatype.jts.JtsModule
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import com.wemove.dcatparser.dcatapde.model.dcat.Catalog
import com.wemove.dcatparser.dcatapeia.model.dcat.Dataset
import com.wemove.dcatparser.dcatapeia.serialization.DcatApEiaDeserializer
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.imports.IgeImporter
import de.ingrid.igeserver.imports.ImportTypeInfo
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.mdek.upload.UploadConfig
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class DcatApEiaImporter(@Lazy val catalogService: CatalogService, @Lazy val documentService: DocumentService, @Lazy val researchService: ResearchService, val uploadConfig: UploadConfig, val behaviourService: BehaviourService, val codelistHandler: CodelistHandler) : IgeImporter {
    private val log = logger()

    private val mapper = jacksonObjectMapper()
        .registerModule(JavaTimeModule())
        .registerModule(JtsModule())
        .registerKotlinModule()

    override fun run(catalogId: String, data: Any, addressMaps: MutableMap<String, String>): JsonNode {
        val deserializer = DcatApEiaDeserializer(null)
        val catalog: Catalog = deserializer.deserialize(data as String).firstOrNull()
            ?: throw ServerException.withReason("DCAT-AP.EIA record could not be deserialized")

        val dataset: Dataset = catalog.dataset?.firstOrNull() as Dataset?
            ?: throw ServerException.withReason("DCAT-AP.EIA catalog does not contain any dataset")

        val dcatApEiaMapper = DcatApEiaMapper(
            dataset,
            catalogId,
            catalogService,
            behaviourService,
            codelistHandler,
            researchService,
            documentService,
        )

        val parsedDoc = dcatApEiaMapper.getDocument()
        val jsonDoc = mapper.valueToTree<JsonNode>(parsedDoc)

        val newAddress = dcatApEiaMapper.newAddress

        log.debug("Created JSON document from imported DCAT-AP.eia file. New document: $jsonDoc")
        return if (newAddress == null) {
            jsonDoc
        } else {
            log.debug("Created JSON address from imported DCAT-AP.eia file. New address: $newAddress")
            jacksonObjectMapper().createArrayNode().apply {
                add(jsonDoc)
                addAll(newAddress)
            }
        }
    }

    override fun canHandleImportFile(contentType: String, fileContent: String): Boolean = "application/rdf+xml" == contentType && fileContent.contains("<dcat:Catalog") && fileContent.contains("xmlns:eia")

    override val typeInfo: ImportTypeInfo
        get() = ImportTypeInfo(
            "dcat-ap-eia",
            "DCAT-AP.EIA",
            "",
            listOf("uvp"),
        )
}
