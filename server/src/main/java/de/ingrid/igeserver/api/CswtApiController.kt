package de.ingrid.igeserver.api

import de.ingrid.igeserver.ClientException
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
@RequestMapping(path = ["/api"])
class CswtApiController (
    private val apiValidationService: ApiValidationService,
    private val ogcCswtService: CswtService,
    private val documentService: DocumentService,
    val scheduler: SchedulerService,
) : CswtApi {

    val log = logger()
    override fun handleCSWT(allRequestParams: Map<String, String>, allHeaders: Map<String, String>, principal: Authentication, service: String, request: String, catalog: String, data: String, datasetFolderId: String?, addressFolderId: String?): ResponseEntity<ByteArray> {
        var statusCode: HttpStatusCode? = null
        var xmlResponse: ByteArray? = null

        try {
            if(service != "CSW" ) throw ClientException.withReason("Request parameter 'SERVICE' must be 'CSW'. Value '$service' not supported.")
            if(request != "Transaction") throw ClientException.withReason("Request parameter 'REQUEST' only accepts value 'Transaction'. Value '$request' not supported.")
            apiValidationService.validateRequestParams(allRequestParams, listOf("catalog", "SERVICE", "REQUEST" , "datasetFolderId", "addressFolderId"))
            apiValidationService.validateCollection(catalog)
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
                parentDocument = if(!datasetFolderId.isNullOrBlank()) { (documentService.getWrapperByCatalogAndDocumentUuid(catalog, datasetFolderId)).id } else null,
                parentAddress = if(!addressFolderId.isNullOrBlank()) { (documentService.getWrapperByCatalogAndDocumentUuid(catalog, addressFolderId)).id } else null,
                overwriteAddresses = true,
                overwriteDatasets = true
            )
            val transactionResult: CSWTransactionResult = ogcCswtService.cswTransaction(data, catalog, principal, options)
            xmlResponse = ogcCswtService.prepareXmlResponse(transactionResult)
            statusCode = if(transactionResult.statusCode == null) HttpStatus.OK else transactionResult.statusCode as HttpStatusCode
        }

        return ResponseEntity.status(statusCode!!).body(xmlResponse)
    }
}