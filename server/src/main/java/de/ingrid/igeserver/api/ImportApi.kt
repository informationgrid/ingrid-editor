/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api

import de.ingrid.igeserver.imports.ImportTypeInfo
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.multipart.MultipartFile
import java.security.Principal
import javax.validation.Valid

@Tag(name = "Import", description = "the import API")
interface ImportApi {
    @Operation
    @GetMapping(value = ["/import"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getImporter(
        principal: Principal,
        @Parameter(description = "The catalog profile to get the supported export types from.") @RequestParam(value = "profile") profile: String
    ): ResponseEntity<List<ImportTypeInfo>>


    /*
        @Operation
        @ApiResponses(
            value = [ApiResponse(
                responseCode = "200",
                description = "The stored dataset, which might contain additional storage information."
            ), ApiResponse(responseCode = "500", description = "Unexpected error")]
        )
        @PostMapping(value = ["/import"], produces = [MediaType.APPLICATION_JSON_VALUE])
        fun importDataset(
            principal: Principal,
            @Parameter(
                description = "The dataset to be imported.",
                required = true
            ) @RequestBody file: @Valid MultipartFile,
            @Parameter(description = "The id of the importer to be used", required = true) @RequestParam importerId: String,
            @Parameter(
                description = "The document parent where the imported file will be added",
                required = true
        ) @RequestParam parentDoc: Int,
            @Parameter(
                description = "The address parent where the imported file will be added",
                required = true
        ) @RequestParam parentAddress: Int,
            @Parameter(description = "Import-Options", required = true) @RequestParam options: String,
        ): ResponseEntity<ImportAnalyzeInfo>
    */

    @Operation
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "The stored dataset, which might contain additional storage information."
        ), ApiResponse(responseCode = "500", description = "Unexpected error")]
    )
    @PostMapping(value = ["/import/analyze"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun analyzeFile(
        principal: Principal,
        @Parameter(description = "The dataset to be imported.", required = true) @RequestBody file: @Valid MultipartFile
    ): ResponseEntity<Unit>

    /*@Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @GetMapping(value = ["/import/log"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getLog(principal: Principal): ResponseEntity<OptimizedImportAnalysis>
*/
}