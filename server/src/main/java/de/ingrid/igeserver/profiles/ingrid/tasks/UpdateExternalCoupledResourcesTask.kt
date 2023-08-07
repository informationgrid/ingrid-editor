package de.ingrid.igeserver.profiles.ingrid.tasks

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.GetRecordUrlAnalysis
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.services.CapabilitiesService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import java.io.FileNotFoundException

@Profile("ingrid")
@Component
class UpdateExternalCoupledResourcesTask(
    val entityManager: EntityManager,
    val transactionManager: PlatformTransactionManager,
    val documentService: DocumentService,
    val capabilitiesService: CapabilitiesService
) {

    val log = logger()
    val mapper = jacksonObjectMapper()

    @Scheduled(cron = "\${cron.externalCoupledResources.expression}")
    fun updateExternalCoupledResources() {
        setAdminAuthentication()
        val urlCache = mutableMapOf<String, GetRecordUrlAnalysis>()
        getAllExternalCoupledResources().forEach {
            updateResource(it, urlCache)
        }

    }

    private fun updateResource(resource: CoupledResourceResult, urlCache: MutableMap<String, GetRecordUrlAnalysis>) {
        resource.links.forEach {
            if (it.url == null) return@forEach

            try {
                val record = urlCache[it.url] ?: capabilitiesService.analyzeGetRecordUrl(it.url)
                urlCache[it.url] = record
                if (it.url != record.identifier || it.uuid != record.uuid) {
                    updateDocument(resource.id, it.url, record)
                }
            } catch (ex: FileNotFoundException) {
                log.warn("Resource not found: ${it.url}")
            }
        }
    }

    private fun updateDocument(id: Int, url: String, record: GetRecordUrlAnalysis) {
        val doc = documentService.docRepo.findById(id).get().apply {
            val arrayNode = data.get("service").get("coupledResources") as ArrayNode
            arrayNode.forEach {
                if (it.get("url")?.asText() == url) {
                    it as ObjectNode
                    it.put("uuid", record.uuid)
                    it.put("identifier", record.identifier)
                    it.put("title", record.title)
                }
            }
        }

        documentService.docRepo.save(doc)
    }

    private fun getAllExternalCoupledResources(): List<CoupledResourceResult> {
        ClosableTransaction(transactionManager).use {
            return entityManager.createNativeQuery(
                """
    SELECT id, uuid, (data -> 'service' -> 'coupledResources') FROM document
    WHERE (state = 'PUBLISHED' OR state = 'DRAFT' OR state = 'DRAFT_AND_PUBLISHED' OR state = 'PENDING')
      AND jsonb_path_exists(jsonb_strip_nulls(data), '$.service.coupledResources')
      AND EXISTS(SELECT
                 FROM jsonb_array_elements(data -> 'service' -> 'coupledResources') as cr
          WHERE (cr -> 'isExternalRef')\:\:bool = true);
          """.trimIndent()
            )
                .resultList
                .map { mapToCoupledResourceResult(it as Array<Any>) }
        }
    }

    private fun mapToCoupledResourceResult(result: Array<Any>): CoupledResourceResult {
        return CoupledResourceResult(
            result[0] as Int,
            result[1].toString(),
            mapper.readValue(result[2] as String, object : TypeReference<List<CoupledResource>>() {})
                .filter { it.isExternalRef }
        )
    }
}

data class CoupledResourceResult(val id: Int, val uuid: String, val links: List<CoupledResource>)
data class CoupledResource(
    var uuid: String?,
    var identifier: String?,
    val url: String?,
    val title: String?,
    val isExternalRef: Boolean
)