package de.ingrid.igeserver.api

import de.ingrid.igeserver.IgeException
import de.ingrid.igeserver.services.CSWTransactionResult
import de.ingrid.igeserver.services.CswtService
import de.ingrid.igeserver.services.ApiValidationService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.SchedulerService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@Profile("csw-t")
@RequestMapping(path = ["/api/cswt"])
class CswtApiController  @Autowired constructor(
    private val apiValidationService: ApiValidationService,
    private val ogcCswtService: CswtService,
    private val documentService: DocumentService,
    val scheduler: SchedulerService,
) : CswtApi {

    val log = logger()
    override fun handleCSWT(allRequestParams: Map<String, String>, allHeaders: Map<String, String>, principal: Authentication, collectionId: String, data: String, datasetFolderId: String?, addressFolderId: String?): ResponseEntity<ByteArray> {
        var statusCode: HttpStatusCode? = null
        var xmlResponse: ByteArray? = null

        try {
            apiValidationService.validateRequestParams(allRequestParams, listOf("datasetFolderId", "addressFolderId"))
            apiValidationService.validateCollection(collectionId)
        } catch (e: IgeException) {
            log.error("Error in CSW transaction", e)
            val paramErrorResult = CSWTransactionResult(
                successful = false,
                statusCode = e.statusCode as HttpStatusCode,
                errorMessage = ogcCswtService.prepareException(e)
            )

            xmlResponse = ogcCswtService.prepareXmlResponse(paramErrorResult)
            statusCode = e.statusCode
        }

        if(xmlResponse == null){
            val options = ImportOptions(
                publish = true,
                parentDocument = if(!datasetFolderId.isNullOrBlank()) { (documentService.getWrapperByCatalogAndDocumentUuid(collectionId, datasetFolderId)).id } else null,
                parentAddress = if(!addressFolderId.isNullOrBlank()) { (documentService.getWrapperByCatalogAndDocumentUuid(collectionId, addressFolderId)).id } else null,
                overwriteAddresses = true,
                overwriteDatasets = true
            )
            val transactionResult: CSWTransactionResult = ogcCswtService.cswTransaction(data, collectionId, principal, options)
            xmlResponse = ogcCswtService.prepareXmlResponse(transactionResult)
            statusCode = if(transactionResult.statusCode == null) HttpStatus.OK else transactionResult.statusCode as HttpStatusCode
        }

        return ResponseEntity.status(statusCode!!).body(xmlResponse)
    }
}