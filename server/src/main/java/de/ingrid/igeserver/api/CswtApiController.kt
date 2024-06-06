/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.IgeException
import de.ingrid.igeserver.features.cswt_api.services.CSWTransactionResult
import de.ingrid.igeserver.features.cswt_api.services.CswtService
import de.ingrid.igeserver.services.ApiValidationService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.SchedulerService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@Profile("csw-t")
@RequestMapping(path = ["/api"])
class CswtApiController (
    private val apiValidationService: ApiValidationService,
    private val ogcCswtService: CswtService,
    private val documentService: DocumentService,
    val scheduler: SchedulerService,
) {

    val log = logger()


    @PostMapping(value = ["/cswt"], consumes = [MediaType.APPLICATION_XML_VALUE], produces = [MediaType.APPLICATION_XML_VALUE])
    @Operation(tags=["CSW-T"], summary = "Insert, Update, Delete Records via CSW-t", hidden = false)
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation."),
        ApiResponse(responseCode = "400", description = "Invalid input"),
        ApiResponse(responseCode = "404", description = "Not found"),
    ])
    fun handleCSWT(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "Value must be 'CSW'" , required = true) @RequestParam("SERVICE", defaultValue = "CSW") service: String = "CSW",
        @Parameter(description = "Value must be 'Transaction'" , required = true ) @RequestParam("REQUEST", defaultValue = "Transaction") request: String,
        @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier)." , required = true) @RequestParam("catalog") catalog: String,
        @Parameter(description = "The datasets to be inserted, delete or updated.", required = true) @RequestBody data: String,
        @Parameter(description = "## Dataset Folder ID \n **Custom Parameter** \n\n Add Dataset to Folder with UUID") @RequestParam(value = "datasetFolderId", required = false) datasetFolderId: String?,
        @Parameter(description = "## Address Folder ID \n **Custom Parameter** \n\n Add Address to Folder with UUID") @RequestParam(value = "addressFolderId", required = false) addressFolderId: String?,
    ): ResponseEntity<ByteArray> {
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