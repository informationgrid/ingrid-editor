package de.ingrid.igeserver.api

import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.services.ApiValidationService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.OgcResourceService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile


@RestController
@Profile("ogc-resources-api")
@RequestMapping(path = ["/api/ogc"])
class OgcResourcesApiController(
    private val apiValidationService: ApiValidationService,
    private val documentRepository: DocumentRepository,
    private val catalogService: CatalogService,
    private val ogcResourceService: OgcResourceService
): OgcResourcesApi {

    val log = logger()

    override fun postResource(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        properties: String?,
        file: MultipartFile
    ): ResponseEntity<String> {
        // check if collectionId & recordId exists
        apiValidationService.validateCollection(collectionId)
        val catalog = catalogService.getCatalogById(collectionId)

        // get profile from Catalog
        val profile = catalog.type

        // get document
        val document = try {
             documentRepository.getByCatalogAndUuidAndIsLatestIsTrue(catalog, recordId)
        } catch(error: Exception) {
            throw NotFoundException.withMissingResource(recordId, "Record")
        }

        val userID = principal.name
        // upload file
        ogcResourceService.uploadResourceWithProperties(collectionId, userID, recordId, file, properties?:"")

        return ResponseEntity.ok().build()
    }




    override fun putResource(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        resourceId: String,
        properties: String,
        file: MultipartFile?
    ): ResponseEntity<String> {
        TODO("Not yet implemented")
    }

    override fun deleteResource(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        resourceId: String
    ): ResponseEntity<String> {
        apiValidationService.validateCollection(collectionId)
        val catalog = catalogService.getCatalogById(collectionId)
        val profile = catalog.type
        val userID = principal.name

        ogcResourceService.deleteResourceWithProperties(collectionId, userID, recordId, resourceId)

        TODO("Not yet implemented")
    }

    override fun getResourceById(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        resourceId: String
    ): ResponseEntity<String> {
        TODO("Not yet implemented")
    }

    override fun getResourcesOfRecord(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String
    ): ResponseEntity<String> {
        TODO("Not yet implemented")
    }
}
